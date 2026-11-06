import { Test, TestingModule } from '@nestjs/testing';
import { ClasificacionController } from './clasificacion.controller';
import { ClasificacionService } from './clasificacion.service';

describe('ClasificacionController', () => {
  let controller: ClasificacionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClasificacionController],
      providers: [ClasificacionService],
    }).compile();

    controller = module.get<ClasificacionController>(ClasificacionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
