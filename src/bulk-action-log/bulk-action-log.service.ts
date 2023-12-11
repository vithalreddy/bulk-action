// bulk-action-log.service.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BulkActionLog } from '../core/database/entities/bulk-action-log.entity';

@Injectable()
export class BulkActionLogService {
  constructor(
    @InjectRepository(BulkActionLog)
    private readonly logRepository: Repository<BulkActionLog>,
  ) {}

  async createLog(
    bulkActionId: number,
    logText: string,
    metadata: Record<string, any> = {},
  ) {
    const logEntry = new BulkActionLog();
    logEntry.bulkActionId = bulkActionId;
    logEntry.logText = logText;
    logEntry.metadata = metadata;

    await this.logRepository.save(logEntry);
  }

  async createLogs(
    logEntries: {
      bulkActionId: number;
      logText: string;
      metadata?: Record<string, any>;
    }[],
  ) {
    const logs = logEntries.map((entry) => {
      const log = new BulkActionLog();
      log.bulkActionId = entry.bulkActionId;
      log.logText = entry.logText;
      log.metadata = entry.metadata || {};
      return log;
    });

    await this.logRepository.save(logs);
  }
}
