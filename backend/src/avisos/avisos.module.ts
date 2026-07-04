import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { MulterModule } from '@nestjs/platform-express';
import { AvisosController } from './avisos.controller';
import { AvisosService } from './avisos.service';

@Module({
  imports: [
    SequelizeModule.forFeature([]),
    MulterModule.register({ dest: './uploads/avisos' }),
  ],
  controllers: [AvisosController],
  providers: [AvisosService],
})
export class AvisosModule {}
