import { ConfigModule } from '@nestjs/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import { runSeeders, SeederOptions } from 'typeorm-extension';

(async () => {
  ConfigModule.forRoot({
    envFilePath: [
      '.env.local',
      '.env.development',
      '.env.development.local',
      '.env',
    ],
  });

  const options: DataSourceOptions & SeederOptions = {
    type: 'postgres',
    host: process.env.DB_HOST,
    port: +process.env.DB_PORT,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: ['src/core/database/entities/*.entity.ts'],
    seeds: ['src/core/database/seeds/*.seeder.ts'],
    factories: ['src/core/database/seeds/factories/*.factory.ts'],
    logging: true,
  };

  const dataSource = new DataSource(options);
  await dataSource.initialize();

  await runSeeders(dataSource, {
    seeds: ['src/core/database/seeds/**/*.seeder{.ts,.js}'],
    factories: ['src/core/database/seeds/factories/**/*{.ts,.js}'],
  });
})();
