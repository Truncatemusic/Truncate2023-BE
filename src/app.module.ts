import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaClient } from '@prisma/client';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { ProjectController } from './project/project.controller';
import { ProjectService } from './project/project.service';

@Module({
  imports: [],
  controllers: [AppController, AuthController, ProjectController],
  providers: [AppService, PrismaClient, AuthService, ProjectService],
})
export class AppModule {}
