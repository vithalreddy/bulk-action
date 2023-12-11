import { setSeederFactory } from 'typeorm-extension';

import { Lead } from '../../entities/lead.entity';

export default setSeederFactory(Lead, (faker) => {
  const r = new Lead();
  r.accountId = faker.number.int({ min: 1, max: 10 });
  r.name = faker.person.fullName();
  r.email = faker.internet.email();
  return r;
});
