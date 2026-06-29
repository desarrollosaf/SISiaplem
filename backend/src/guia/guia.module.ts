import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { GuiaController } from './guia.controller';
import { GuiaService } from './guia.service';

@Module({
  imports: [SequelizeModule.forFeature([])],
  controllers: [GuiaController],
  providers: [GuiaService],
})
export class GuiaModule {}
