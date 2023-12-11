import { setSeederFactory } from 'typeorm-extension';

import { Opportunity } from '../../entities/opportunity.entity';

export default setSeederFactory(Opportunity, (faker) => {
  const r = new Opportunity();
  r.accountId = faker.number.int({ min: 1, max: 10 });
  r.title = faker.lorem.text();
  r.status = faker.helpers.arrayElement(['A', 'B', 'C', 'D']);
  return r;
});
