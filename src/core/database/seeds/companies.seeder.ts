import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';

import { Company } from './../entities/company.entity';
import { NUM_OF_RECORDS } from './seeds.constats';

export default class CompanySeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<any> {
    if (!process.env.SKIP_TRUNACATE)
      await dataSource.query(`TRUNCATE "company" RESTART IDENTITY;`);

    const f = await factoryManager.get(Company);
    try {
      await f.saveMany(NUM_OF_RECORDS, undefined, { chunk: 1000 });
    } catch (error) {
      if (
        error?.message?.includes(`already exists`) ||
        error?.message?.includes(`duplicate`)
      ) {
        console.warn(`Duplicate records found skipping`, error);
      } else throw error;
    }
  }
}
