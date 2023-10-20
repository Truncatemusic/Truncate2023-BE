import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { VersionService } from './version/version.service';
import { UserService } from '../user/user.service';
import { AuthService } from '../auth/auth.service';
import { StorageService } from '../storage/storage.service';
import { env } from 'process';
import { ProjectUserRole } from './project-user-role.type';

@Injectable()
export class ProjectService {
  static readonly BUCKET_PREFIX =
    (env.GOOGLE_STORAGE_BUCKET_PREFIX || '') + 'truncate-project-';

  static getBucketName(projectId: number) {
    return this.BUCKET_PREFIX + projectId;
  }

  constructor(
    private readonly prisma: PrismaClient,
    private readonly storageService: StorageService,
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly versionService: VersionService,
  ) {}

  async getInfo(id: number) {
    try {
      const project = await this.prisma.tproject.findUnique({
        where: { id: id },
      });

      return !Number.isInteger(project?.id)
        ? { success: false, reason: 'UNKNOWN' }
        : {
            success: true,
            name: project.name,
            versions: (await this.versionService.getVersions(project.id)).map(
              (version) => ({
                versionNumber: version.versionNumber,
                timestamp: version.timestamp,
                songBPM: version.songBPM,
                songKey: version.songKey,
              }),
            ),
          };
    } catch (_) {
      return { success: false, reason: 'UNKNOWN' };
    }
  }

  async createProject(
    userId: number,
    name: string,
    songBPM?: number,
    songKey?: string,
  ) {
    if (!name || !String(name).trim())
      return { success: false, reason: 'INVALID_PROJECT_NAME' };

    let project: { id: number; name: string }, versionNumber: number;
    try {
      project = await this.prisma.tproject.create({
        data: { name: name },
      });

      versionNumber = await this.versionService.addVersion(
        project.id,
        songBPM,
        songKey,
      );
      await this.addUserToProject(project.id, userId, 'O');
    } catch (error) {
      console.error(error);
      return { success: false, reason: 'UNKNOWN' };
    }

    await this.storageService.createBucket(
      ProjectService.getBucketName(project.id),
    );

    return {
      success: true,
      project_id: project.id,
      versionNumber,
      name: project.name,
      songBPM,
      songKey,
    };
  }

  async renameProject(id: number, name: string) {
    try {
      await this.prisma.tproject.update({
        where: { id },
        data: { name },
      });

      return { success: true };
    } catch (_) {
      return { success: false, reason: 'UNKNOWN' };
    }
  }

  async deleteProject(id: number) {
    try {
      await this.prisma.tprojectchecklist.deleteMany({
        where: {
          project_id: id,
        },
      });
      await this.prisma.tprojectversionfile.deleteMany({
        where: {
          tprojectversion: {
            project_id: id,
          },
        },
      });
      await this.prisma.tprojectversion.deleteMany({
        where: {
          project_id: id,
        },
      });
      await this.prisma.tprojectuser.deleteMany({
        where: { project_id: id },
      });
      await this.prisma.tproject.delete({
        where: { id },
      });

      await this.storageService.deleteBucket(ProjectService.getBucketName(id));

      return { success: true };
    } catch (_) {
      return { success: false, reason: 'UNKNOWN' };
    }
  }

  async getUserRole(projectId: number, userId: number) {
    return (
      (
        await this.prisma.tprojectuser.findFirst({
          where: {
            project_id: projectId,
            user_id: userId,
          },
          select: { role: true },
        })
      )?.role || null
    );
  }

  async getUserRoleBySession(projectId: number, request: Request) {
    const userId = await this.authService.getUserId(request);
    return userId ? await this.getUserRole(projectId, userId) : null;
  }

  async addUserToProject(
    projectId: number,
    userId: number,
    role: ProjectUserRole,
  ) {
    try {
      if (!(await this.userService.userExists(userId)))
        return { success: false, reason: 'USER_DOES_NOT_EXIST' };

      const projectUserId = (
        await this.prisma.tprojectuser.findFirst({
          where: {
            project_id: projectId,
            user_id: userId,
          },
          select: { id: true },
        })
      )?.id;

      if (projectUserId) {
        await this.prisma.tprojectuser.update({
          where: { id: projectUserId },
          data: { role },
        });
        return { success: true, action: 'UPDATED' };
      }

      await this.prisma.tprojectuser.create({
        data: {
          project_id: projectId,
          user_id: userId,
          role,
        },
      });
      return { success: true, action: 'ADDED' };
    } catch (_) {
      return { success: false, reason: 'UNKNOWN' };
    }
  }
}
