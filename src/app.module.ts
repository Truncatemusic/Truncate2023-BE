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
import { FileController } from './project/version/file/file.controller';
import { FileService } from './project/version/file/file.service';
import { ChecklistService } from './project/checklist/checklist.service';
import { ChecklistController } from './project/checklist/checklist.controller';

@Module({
  imports: [],
  controllers: [AppController, AuthController, ProjectController, UserController, VersionController, FileController, ChecklistController],
  providers: [AppService, PrismaClient, AuthService, ProjectService, UserService, VersionService, FileService, ChecklistService],
})
export class AppModule {}
