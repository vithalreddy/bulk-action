import { setSeederFactory } from 'typeorm-extension';

import { Contact } from '../../entities/contact.entity';

export default setSeederFactory(Contact, (faker) => {
  const r = new Contact();
  r.accountId = faker.number.int({ min: 1, max: 10 });
  r.name = faker.person.fullName();
  r.email = faker.internet.email();
  r.status = faker.helpers.arrayElement(['A', 'B', 'C', 'D']);
  return r;
});
