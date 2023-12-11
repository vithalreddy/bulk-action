import { Test, TestingModule } from '@nestjs/testing';
import { BulkActionLogService } from './bulk-action-log.service';

describe('BulkActionLogService', () => {
  let service: BulkActionLogService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BulkActionLogService],
    }).compile();

    service = module.get<BulkActionLogService>(BulkActionLogService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
