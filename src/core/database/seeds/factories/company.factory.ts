import { setSeederFactory } from 'typeorm-extension';

import { Company } from '../../entities/company.entity';

export default setSeederFactory(Company, (faker) => {
  const r = new Company();
  r.accountId = faker.number.int({ min: 1, max: 10 });
  r.name = faker.company.name();
  r.industry = faker.commerce.department();
  return r;
});
