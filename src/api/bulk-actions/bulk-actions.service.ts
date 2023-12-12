import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BulkAction } from '../../core/database/entities/bulk-action.entity';
import { BulkActionLog } from '../../core/database/entities/bulk-action-log.entity';
import {
  RABBITMQ_EXCHANGES,
  RABBITMQ_QUEUES,
} from '../../core/rabbitmq/rabbitmq.constants';
import { CreateBulkActionDto } from './bulk-actions.dto';

@Injectable()
export class BulkActionsService {
  constructor(
    @InjectRepository(BulkAction)
    private bulkActionRepository: Repository<BulkAction>,
    private readonly amqpConn: AmqpConnection,
    @InjectRepository(BulkActionLog)
    private readonly logRepository: Repository<BulkActionLog>,
  ) {}

  async createBulkAction(
    createBulkActionDto: CreateBulkActionDto,
  ): Promise<BulkAction> {
    const queryRunner =
      this.bulkActionRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const bulkAction = new BulkAction();
      bulkAction.accountId = 1;
      bulkAction.entity = createBulkActionDto.entity;
      bulkAction.actionType = 'update';
      bulkAction.rules = createBulkActionDto.rules as any;
      bulkAction.updateData = createBulkActionDto.updateData;
      const dbRow = await queryRunner.manager.save(bulkAction);

      await this.amqpConn.publish(
        RABBITMQ_EXCHANGES.BulkUpdates,
        RABBITMQ_QUEUES.BulkUpdates,
        { bulkActionId: dbRow.id },
      );

      await queryRunner.commitTransaction();
      return bulkAction;
    } catch (error) {
      //log error
      await queryRunner.rollbackTransaction();
      throw error; // Rethrow the error after rollback
    } finally {
      await queryRunner.release();
    }
  }

  async getAllBulkActions(page: number = 1, limit: number = 10) {
    const [results, total] = await this.bulkActionRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { id: 'DESC' },
    });
    return {
      data: results,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  async getBulkActionStatus(actionId: number) {
    return await this.bulkActionRepository.findOneBy({ id: actionId });
  }

  async getBulkActionStats(actionId: number) {
    const bulkAction = await this.bulkActionRepository.findOneBy({
      id: actionId,
    });
    if (!bulkAction) throw new Error('Bulk action not found');

    return {
      status: bulkAction.status,
      totalRecords: bulkAction.totalRecords,
      processedRecords: bulkAction.processedRecords,
      successCount: bulkAction.successCount,
      failureCount: bulkAction.failureCount,
      skippedCount: bulkAction.skippedCount,
    };
  }

  async getBulkActionLogs(
    actionId: number,
    page: number = 1,
    limit: number = 10,
    search?: string,
  ) {
    const queryBuilder = this.logRepository
      .createQueryBuilder('log')
      .where('log.bulkActionId = :actionId', { actionId })
      .orderBy('log.id', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (search) {
      queryBuilder.andWhere(
        `to_tsvector('english', log.logText) @@ plainto_tsquery('english', :search)`,
        { search },
      );
    }

    const [results, total] = await queryBuilder.getManyAndCount();

    return {
      data: results,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }
}
