import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BulkActionLog } from '../core/database/entities/bulk-action-log.entity';
import { BulkActionLogService } from './bulk-action-log.service';

@Module({
  imports: [TypeOrmModule.forFeature([BulkActionLog])],
  providers: [BulkActionLogService],
  exports: [BulkActionLogService],
})
export class BulkActionLogModule {}
