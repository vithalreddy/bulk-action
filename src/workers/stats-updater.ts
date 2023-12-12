import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BulkAction } from '../core/database/entities/bulk-action.entity';

@Injectable()
export class StatsBatchProcessor {
  private batches: Map<
    number,
    {
      updated: number;
      failed: number;
      skipped: number;
      processedRecords: number;
    }
  > = new Map();
  private interval = 2000;

  constructor(
    @InjectRepository(BulkAction)
    private bulkActionRepository: Repository<BulkAction>,
  ) {
    setInterval(() => this.processBatch(), this.interval);
  }

  addToBatch(rowId, updates) {
    if (!this.batches.has(rowId)) {
      this.batches.set(rowId, {
        updated: 0,
        failed: 0,
        skipped: 0,
        processedRecords: 0,
      });
    }
    const currentBatch = this.batches.get(rowId);
    currentBatch.updated += updates.updated;
    currentBatch.failed += updates.failed;
    currentBatch.skipped += updates.skipped;
    currentBatch.processedRecords +=
      updates.updated + updates.failed + updates.skipped;

    console.log('currentBatch Batch Stats:', currentBatch);
  }

  async processBatch() {
    for (const [rowId, updates] of this.batches) {
      try {
        await this.updateStats(rowId, updates);
        this.batches.delete(rowId);
      } catch (error) {
        Logger.error(
          `Error updating stats for rowId ${rowId}: ${error.message}`,
        );
      }
    }
  }

  async updateStats(
    rowId: number,
    { updated, failed, skipped, processedRecords }: Record<string, number>,
  ) {
    try {
      await this.bulkActionRepository
        .createQueryBuilder()
        .update(BulkAction)
        .set({
          successCount: () => `successCount + ${updated}`,
          failureCount: () => `failureCount + ${failed}`,
          skippedCount: () => `skippedCount + ${skipped}`,
          processedRecords: () => `processedRecords + ${processedRecords}`,
        })
        .where('id = :id', { id: rowId })
        .execute();

      console.log('UPDATE ', rowId, {
        updated,
        failed,
        skipped,
        processedRecords,
      });
    } catch (error) {
      Logger.error(
        rowId,
        `[BulkUpdateBatchWorker]: Error updating stats ${rowId}. reason: ${error?.message}`,
      );
    }
  }
}
