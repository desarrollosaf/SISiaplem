import { Test, TestingModule } from '@nestjs/testing';
import { CadidoController } from './cadido.controller';

describe('CadidoController', () => {
  let controller: CadidoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CadidoController],
    }).compile();

    controller = module.get<CadidoController>(CadidoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
