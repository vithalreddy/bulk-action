import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';

import { Opportunity } from './../entities/opportunity.entity';
import { NUM_OF_RECORDS } from './seeds.constats';

export default class OpportunitySeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<any> {
    if (!process.env.SKIP_TRUNACATE)
      await dataSource.query(`TRUNCATE "opportunity" RESTART IDENTITY;`);

    const f = await factoryManager.get(Opportunity);
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
