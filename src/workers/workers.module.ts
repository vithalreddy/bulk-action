import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BulkActionLogService } from '../bulk-action-log/bulk-action-log.service';
import { BulkAction } from '../core/database/entities/bulk-action.entity';
import { BulkActionLog } from '../core/database/entities/bulk-action-log.entity';
import { RabbitMQModule } from '../core/rabbitmq/rabbitmq.module';
import { BulkUpdateBatchWorkerService } from './bulk-update-batch-worker.service';
import { BulkUpdateWorkerService } from './bulk-update-worker.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([BulkAction]),
    TypeOrmModule.forFeature([BulkActionLog]),
    RabbitMQModule,
  ],
  providers: [
    BulkUpdateWorkerService,
    BulkUpdateBatchWorkerService,
    BulkActionLogService,
  ],
})
export class WorkersModule {}
