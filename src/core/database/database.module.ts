import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BulkAction } from './entities/bulk-action.entity';
import { BulkActionLog } from './entities/bulk-action-log.entity';
import { Company } from './entities/company.entity';
import { Contact } from './entities/contact.entity';
import { Lead } from './entities/lead.entity';
import { Opportunity } from './entities/opportunity.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [
          Contact,
          Company,
          Lead,
          Opportunity,
          BulkAction,
          BulkActionLog,
        ],
        synchronize: true, //TODO: remove
        // logging: true, //TODO: remove
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
