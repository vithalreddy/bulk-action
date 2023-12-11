import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BulkAction } from '../../core/database/entities/bulk-action.entity';
import { BulkActionLog } from '../../core/database/entities/bulk-action-log.entity';
import { RabbitMQModule } from '../../core/rabbitmq/rabbitmq.module';
import { BulkActionsController } from './bulk-actions.controller';
import { BulkActionsService } from './bulk-actions.service';

@Module({
  controllers: [BulkActionsController],
  providers: [BulkActionsService],
  imports: [
    TypeOrmModule.forFeature([BulkAction, BulkActionLog]),
    RabbitMQModule,
  ],
})
export class BulkActionsModule {}
