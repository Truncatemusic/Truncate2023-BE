import { existsSync, writeFileSync, readFileSync, unlinkSync } from 'fs';
import { Injectable } from '@nestjs/common';
import { join } from 'path';
import { PrismaClient } from '@prisma/client';
import { env, cwd } from 'process';
import { StorageService } from '../../../storage/storage.service';
import { ProjectUserRole } from '../../project-user-role.type';
import { createHash } from 'crypto';
import { ProjectService } from '../../project.service';

@Injectable()
export class FileService {
  private static TMP_PATH = join(env.CWD || cwd(), 'tmp');

  static generateTmpFileId() {
    return createHash('sha512')
      .update(new Date().getTime() + '' + Math.random())
      .digest('hex')
      .substring(0, 128);
  }

  static generateTmpPath() {
    return join(this.TMP_PATH, this.generateTmpFileId());
  }

  static getFileName(id: string, type?: string) {
    return type ? id + '.' + type : id;
  }

  static getFilePath(id: string, type?: string) {
    return join(this.TMP_PATH, this.getFileName(id, type));
  }

  constructor(
    private readonly prisma: PrismaClient,
    private readonly storageService: StorageService,
  ) {}

  private fileExists(id: string, type?: string) {
    return existsSync(FileService.getFilePath(id, type));
  }

  private async upload(bucketName: string, id: string, type?: string) {
    if (this.fileExists(id, type)) {
      await this.storageService.uploadBuffer(
        bucketName,
        FileService.getFileName(id, type),
        readFileSync(FileService.getFilePath(id, type)),
      );
      return true;
    }
    return false;
  }

  clear(id: string, type?: string) {
    if (this.fileExists(id, type))
      unlinkSync(FileService.getFilePath(id, type));
  }

  async exists(versionId: number, id: string, type: string) {
    return !!(
      await this.prisma.tprojectversionfile.findFirst({
        where: {
          id,
          type,
          projectversion_id: versionId,
        },
        select: { projectversion_id: true },
      })
    )?.projectversion_id;
  }

  async getUserFileRole(
    fileId: string,
    userId: number,
  ): Promise<ProjectUserRole | null> {
    return (
      ((
        await this.prisma.tprojectuser.findFirst({
          where: {
            tproject: {
              tprojectversion: {
                some: {
                  tprojectversionfile: {
                    some: {
                      id: fileId,
                    },
                  },
                },
              },
            },
            user_id: userId,
          },
          select: { role: true },
        })
      )?.role as ProjectUserRole) || null
    );
  }

  async getFile(fileId: string) {
    const result = await this.prisma.tprojectversionfile.findFirst({
      where: {
        id: fileId,
      },
    });
    return result.id ? result : null;
  }

  async getUserFileAndRole(fileId: string, userId: number) {
    const userFileRole = await this.getUserFileRole(fileId, userId);
    return userFileRole
      ? {
          role: userFileRole,
          file: await this.getFile(fileId),
        }
      : {
          role: null,
          file: undefined,
        };
  }

  async getProjectIdByFileId(fileId: string) {
    return (
      (
        await this.prisma.tprojectversion.findFirst({
          where: {
            tprojectversionfile: {
              some: {
                id: fileId,
              },
            },
          },
          select: { project_id: true },
        })
      )?.project_id || null
    );
  }

  private async save(buffer: Buffer, type?: string) {
    const id = FileService.generateTmpFileId();
    writeFileSync(FileService.getFilePath(id, type), buffer);
    return id;
  }

  async addFile(
    versionId: number,
    bufferOrId: Buffer | string,
    type: string,
    addToDB: boolean = true,
    upload: boolean = true,
    bucketName?: string,
    clear: boolean = true,
  ) {
    const id =
      typeof bufferOrId === 'string'
        ? bufferOrId
        : await this.save(bufferOrId, type);

    if (addToDB && !(await this.exists(versionId, id, type)))
      await this.prisma.tprojectversionfile.create({
        data: {
          id,
          type,
          projectversion_id: versionId,
        },
      });

    if (upload) {
      if (!bucketName)
        bucketName = ProjectService.getBucketName(
          await this.getProjectIdByFileId(id),
        );

      await this.upload(bucketName, id, type);
    }

    if (clear) this.clear(id, type);

    return { id, bucketName };
  }
}
