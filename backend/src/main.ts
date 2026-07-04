import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors({ origin: 'http://localhost:4200' });
  app.setGlobalPrefix('api');
  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads' });
  await app.listen(process.env.PORT ?? 3050);
}
bootstrap();
