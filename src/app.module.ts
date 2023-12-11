import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { BulkActionsModule } from './api/bulk-actions/bulk-actions.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BulkActionLogModule } from './bulk-action-log/bulk-action-log.module';
import { DatabaseModule } from './core/database/database.module';
import { RabbitMQModule } from './core/rabbitmq/rabbitmq.module';
import { WorkersModule } from './workers/workers.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [
        '.env.local',
        '.env.development',
        '.env.development.local',
        '.env',
      ],
    }),
    DatabaseModule,
    RabbitMQModule,
    BulkActionsModule,
    WorkersModule,
    BulkActionLogModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
