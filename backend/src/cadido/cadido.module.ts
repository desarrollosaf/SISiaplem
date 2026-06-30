import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CadidoController } from './cadido.controller';
import { CadidoService } from './cadido.service';

@Module({
  imports: [SequelizeModule.forFeature([])],
  controllers: [CadidoController],
  providers: [CadidoService],
})
export class CadidoModule {}
