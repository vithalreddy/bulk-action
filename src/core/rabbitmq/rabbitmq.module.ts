import { RabbitMQModule as BaseRabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { RABBITMQ_EXCHANGES, RABBITMQ_QUEUES } from './rabbitmq.constants';

@Module({
  imports: [
    BaseRabbitMQModule.forRootAsync(BaseRabbitMQModule, {
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const protocol = configService.get<string>('RABBITMQ_PROTOCOL');
        const host = configService.get<string>('RABBITMQ_HOST');
        const port = configService.get<number>('RABBITMQ_PORT');
        const user = configService.get<string>('RABBITMQ_USER');
        const pass = configService.get<string>('RABBITMQ_PASS');
        const conn = `${protocol}://${user}:${pass}@${host}:${port}`;

        return {
          uri: conn,
          connectionInitOptions: { wait: false },
          exchanges: [
            {
              name: RABBITMQ_EXCHANGES.BulkUpdates,
              type: 'direct', // https://hevodata.com/learn/rabbitmq-exchange-type/
            },
            {
              name: RABBITMQ_EXCHANGES.BulkUpdatesBatchWorker,
              type: 'direct',
            },
          ],
          channels: {
            [RABBITMQ_QUEUES.BulkUpdates]: {
              prefetchCount: 10, // adjust based on data
            },
            [RABBITMQ_QUEUES.BulkUpdatesBatchWorker]: {
              prefetchCount: 10, // adjust based on data
            },
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  exports: [BaseRabbitMQModule],
})
export class RabbitMQModule {}
