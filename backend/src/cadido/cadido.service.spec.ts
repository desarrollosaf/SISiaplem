import { Test, TestingModule } from '@nestjs/testing';
import { CadidoService } from './cadido.service';

describe('CadidoService', () => {
  let service: CadidoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CadidoService],
    }).compile();

    service = module.get<CadidoService>(CadidoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
