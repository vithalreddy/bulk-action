import { AmqpConnection, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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
import { WORKER_BATCH_SIZE } from './worker.constants';

@Injectable()
export class BulkUpdateWorkerService {
  constructor(
    @InjectRepository(BulkAction)
    private bulkActionRepository: Repository<BulkAction>,
    private readonly amqpConn: AmqpConnection,
    private readonly bulkActionLogService: BulkActionLogService,
  ) {}

  @RabbitSubscribe({
    exchange: RABBITMQ_EXCHANGES.BulkUpdates,
    routingKey: RABBITMQ_QUEUES.BulkUpdates,
    queue: RABBITMQ_QUEUES.BulkUpdates,
  })
  public async handleBulkUpdateMessage(msg: any) {
    await this.bulkActionLogService.createLog(
      msg.bulkActionId,
      '[BulkUpdateWorker]: Bulk update process started.',
    );

    const row = await this.findAndChangeStatus(msg);

    await this.ScheduleBatchProcessing(row);
  }

  private async findAndChangeStatus(msg: any) {
    if (!msg.bulkActionId) {
      //Log error
      return;
    }
    const now = new Date();
    const row = await this.bulkActionRepository.findOneBy({
      id: msg.bulkActionId,
    });

    if (row.status != BulkActionStatus.pending) {
      //Log error duplicate
      return;
    }

    row.status = BulkActionStatus.workInProgress;
    row.updatedAt = now;

    await this.bulkActionRepository.save(row);
    await this.bulkActionLogService.createLog(
      msg.bulkActionId,
      `[BulkUpdateWorker]: Bulk update status changed to ${BulkActionStatus.workInProgress}`,
    );

    return row;
  }

  private async ScheduleBatchProcessing(row: BulkAction) {
    const allRecords = await this.bulkActionRepository.manager
      .createQueryBuilder()
      .from(row.entity, null)
      .withDeleted()
      .getCount();

    row.totalRecords = allRecords;
    await this.bulkActionRepository.save(row);

    await this.publishBatches(row, allRecords);
  }

  private async publishBatches(row: BulkAction, totalRecords: number) {
    await this.bulkActionLogService.createLog(
      row.id,
      `[BulkUpdateWorker]: Bulk update starting process to divide work in batches for records #${totalRecords}`,
    );
    const totalBatches = Math.ceil(totalRecords / WORKER_BATCH_SIZE);

    for (let batchNumber = 1; batchNumber <= totalBatches; batchNumber++) {
      const isFirstBatch = batchNumber === 1;
      const isLastBatch = batchNumber === totalBatches;

      await this.amqpConn.publish(
        RABBITMQ_EXCHANGES.BulkUpdatesBatchWorker,
        RABBITMQ_QUEUES.BulkUpdatesBatchWorker,
        {
          bulkActionId: row.id,
          batchNumber,
          totalRecords,
          batchSize: WORKER_BATCH_SIZE,
          isFirstBatch,
          isLastBatch,
        },
      );
    }
  }
}
