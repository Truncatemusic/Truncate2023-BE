import { Test, TestingModule } from '@nestjs/testing';
import { ChangeEmailController } from './change-email.controller';

describe('ChangeEmailController', () => {
  let controller: ChangeEmailController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChangeEmailController],
    }).compile();

    controller = module.get<ChangeEmailController>(ChangeEmailController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
