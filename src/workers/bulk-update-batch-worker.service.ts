import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Engine, Rule } from 'json-rules-engine';
import { Repository } from 'typeorm';

import { BulkActionLogService } from '../bulk-action-log/bulk-action-log.service';
import {
  BulkAction,
  BulkActionStatus,
} from '../core/database/entities/bulk-action.entity';
import {
  RABBITMQ_EXCHANGES,
  RABBITMQ_QUEUES,
} from '../core/rabbitmq/rabbitmq.constants';
import { WORKER_BATCH_UPDATE_SIZE } from './worker.constants';

@Injectable()
export class BulkUpdateBatchWorkerService {
  constructor(
    @InjectRepository(BulkAction)
    private bulkActionRepository: Repository<BulkAction>,
    private readonly bulkActionLogService: BulkActionLogService,
  ) {}

  @RabbitSubscribe({
    exchange: RABBITMQ_EXCHANGES.BulkUpdatesBatchWorker,
    routingKey: RABBITMQ_QUEUES.BulkUpdatesBatchWorker,
    queue: RABBITMQ_QUEUES.BulkUpdatesBatchWorker,
  })
  public async handleBulkUpdateBatchMessage(msg: any) {
    let row1: BulkAction;
    try {
      await this.bulkActionLogService.createLog(
        msg.bulkActionId,
        `[BulkUpdateBatchWorker]: Received batch ${msg.batchNumber} for processing. #Records: ${msg.batchSize}.`,
      );

      const row = await this.bulkActionRepository.findOneBy({
        id: msg.bulkActionId,
      });
      if (!row || row.status != BulkActionStatus.workInProgress) {
        console.error('Error: Row not found or status mismatch');
        return;
      }
      row1 = row;
      await this.FindAndUpdateRowsPaginated(
        row,
        msg.batchNumber,
        msg.totalRecords,
        msg.batchSize,
      );

      await this.bulkActionLogService.createLog(
        row.id,
        `[BulkUpdateBatchWorker]: Completed processing batch ${msg.batchNumber}. #Records: ${msg.batchSize}.`,
      );

      if (msg.isLastBatch) {
        row.status = BulkActionStatus.completed;
        await this.bulkActionRepository.save(row);
        await this.bulkActionLogService.createLog(
          msg.bulkActionId,
          '[BulkUpdateBatchWorker]: Bulk update process completed.',
        );
      }
    } catch (error) {
      row1.status = BulkActionStatus.failed;
      await this.bulkActionRepository.save(row1);
      await this.bulkActionLogService.createLog(
        msg.bulkActionId,
        `[BulkUpdateBatchWorker]: Error processing batch ${msg.batchNumber}: ${error.message}`,
      );
    }
  }

  public async FindAndUpdateRowsPaginated(
    row: BulkAction,
    batchNumber: number,
    totalRecords: number,
    batchSize: number,
  ) {
    await this.bulkActionLogService.createLog(
      row.id,
      `[BulkUpdateBatchWorker]: Started processing batch ${batchNumber}.`,
    );

    const batchLimit = batchSize;
    const batchOffset = (batchNumber - 1) * batchLimit;

    const engine = new Engine();
    engine.addRule(
      new Rule({ ...row.rules, event: { type: 'matchedRecord' } }),
    );

    let subsetOffset = batchOffset;
    let moreRecords = true;

    while (moreRecords) {
      let updated = 0,
        failed = 0,
        skipped = 0;
      const logs = [];

      const records = await this.fetchRecords(
        row.entity,
        subsetOffset,
        WORKER_BATCH_UPDATE_SIZE,
      );
      // console.log('records', batchNumber, subsetOffset, records.length);
      if (records.length === 0) {
        moreRecords = false;
        break;
      }

      for (const record of records) {
        try {
          const { events } = await engine.run(record);
          // console.log('Record Passed', record.id, record, events);
          if (events.length) {
            Object.assign(record, row.updateData);
            await this.saveRecord(row.entity, record.id, row.updateData);
            updated++;
            logs.push(
              `[BulkUpdateBatchWorker]: Batch: ${batchNumber} Record ID: ${record.id}, Outcome: Updated`,
            );
          } else {
            skipped++;
            logs.push(
              `[BulkUpdateBatchWorker]: Batch: ${batchNumber} Record ID: ${record.id}, Outcome: Skipped`,
            );
          }
        } catch (error) {
          failed++;
          console.error(error);
          logs.push(
            `[BulkUpdateBatchWorker]: Batch: ${batchNumber} Record ID: ${record.id}, Outcome: Failed due to ${error.message}`,
          );
        }
      }

      subsetOffset += WORKER_BATCH_UPDATE_SIZE;
      if (subsetOffset >= batchOffset + batchLimit) {
        moreRecords = false;
      }

      console.log('Batch Stats:', { updated, failed, skipped });
      await this.updateStats(row, { updated, failed, skipped }, batchNumber);
      await this.bulkActionLogService.createLogs(
        logs.map((el) => ({ bulkActionId: row.id, logText: el })),
      );
    }
  }

  private async fetchRecords(
    entityClass: string,
    offset: number,
    limit: number,
  ) {
    const queryBuilder = this.bulkActionRepository.manager
      .createQueryBuilder()
      .select()
      .from(entityClass, 'entity')
      .withDeleted()
      .orderBy('id', 'ASC')
      .skip(offset)
      .take(limit);

    return queryBuilder.getRawMany();
  }

  private async saveRecord(
    entityName: string,
    recordId: number,
    updateData: Record<string, any>,
  ) {
    try {
      const updateQueryBuilder = this.bulkActionRepository.manager
        .createQueryBuilder()
        .update(entityName)
        .set(updateData)
        .where('id = :id', { id: recordId });

      await updateQueryBuilder.execute();
    } catch (error) {
      console.error(error);
      throw new Error(`Failed to save record: ${error.message}`);
    }
  }

  async updateStats(
    row: BulkAction,
    { updated, failed, skipped }: Record<string, number>,
    batchNumber: number,
  ) {
    try {
      const processedRecords = updated + failed + skipped;

      await this.bulkActionRepository
        .createQueryBuilder()
        .update(BulkAction)
        .set({
          successCount: () => `successCount + ${updated}`,
          failureCount: () => `failureCount + ${failed}`,
          skippedCount: () => `skippedCount + ${skipped}`,
          processedRecords: () => `processedRecords + ${processedRecords}`,
        })
        .where('id = :id', { id: row.id })
        .execute();
    } catch (error) {
      await this.bulkActionLogService.createLog(
        row.id,
        `[BulkUpdateBatchWorker]: Error updating stats for batch ${batchNumber}. reason: ${error?.message}`,
      );
    }
  }
}
