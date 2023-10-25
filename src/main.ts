import { config as dotenvConfig } from 'dotenv';
dotenvConfig();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from 'dotenv';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { Logger, ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { env, chdir, cwd } from 'process';
import { AudiowaveformService } from './audiowaveform/audiowaveform.service';
import * as process from 'process';

async function bootstrap() {
  const logger = new Logger('bootstrap');

  if (env.CWD) chdir(env.CWD);
  logger.log('CWD: ' + cwd());

  const audioWaveformService = new AudiowaveformService();
  const { wasInstalled, installedSuccessfully } =
    await audioWaveformService.install();
  if (!wasInstalled && !installedSuccessfully) {
    logger.error(
      "audiowaveform need to be installed! Install using: 'sudo npm run install:audiowaveform:<debian|ubuntu|macosx>'",
    );
    process.exit(1);
  }

  config();
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalPipes(new ValidationPipe());
  app.useStaticAssets(join(__dirname, '..', 'public'));

  app.use(cookieParser());
  app.enableCors({
    origin: env.CORS_ORIGIN,
    credentials: true,
    allowedHeaders: ['content-type'],
  });
  await app.listen(3000);
}

bootstrap().then();
