import { Test, TestingModule } from '@nestjs/testing';
import { ChangeEmailService } from './change-email.service';

describe('ChangeEmailService', () => {
  let service: ChangeEmailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChangeEmailService],
    }).compile();

    service = module.get<ChangeEmailService>(ChangeEmailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
