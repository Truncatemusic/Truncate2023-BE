import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from 'dotenv';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { ValidationPipe } from '@nestjs/common';
import * as cors from 'cors'; // Import cors module

async function bootstrap() {
  config();
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalPipes(new ValidationPipe());
  app.useStaticAssets(join(__dirname, '..', 'public')); // Adjust the path to your static assets

  // Use the cors module to enable CORS
  app.use(cors());

  await app.listen(3000);
}

bootstrap();
