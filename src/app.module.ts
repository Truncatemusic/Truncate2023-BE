import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaClient } from '@prisma/client';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { ProjectController } from './project/project.controller';
import { ProjectService } from './project/project.service';
import { UserController } from './user/user.controller';
import { UserService } from './user/user.service';
import { VersionController } from './project/version/version.controller';
import { VersionService } from './project/version/version.service';

@Module({
  imports: [],
  controllers: [AppController, AuthController, ProjectController, UserController, VersionController],
  providers: [AppService, PrismaClient, AuthService, ProjectService, UserService, VersionService],
})
export class AppModule {}
