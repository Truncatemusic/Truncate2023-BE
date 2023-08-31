import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from 'dotenv';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  config();
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalPipes(new ValidationPipe());
  app.useStaticAssets(join(__dirname, '..', 'public'));

  app.use(cookieParser());
  app.enableCors({
      origin: 'http://localhost:4200',
      credentials: true,
      allowedHeaders: ['content-type']
  });
  await app.listen(3000);
}

bootstrap().then();
