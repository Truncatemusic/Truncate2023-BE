import { existsSync, writeFileSync, readFileSync, unlinkSync } from 'fs';
import * as wav from 'node-wav';
import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import { join } from 'path';
import { PrismaClient } from '@prisma/client';
import * as Mp32Wav from 'mp3-to-wav';
import { env, cwd } from 'process';
import { StorageService } from '../../../storage/storage.service';
import { ProjectService } from '../../project.service';
import { ProjectUserRole } from '../../project-user-role.type';
import { AudiowaveformService } from '../../../audiowaveform/audiowaveform.service';

@Injectable()
export class FileService {
  static ROOT_PATH = join(env.CWD || cwd(), env.STORAGE_DIR || 'files');

  static ROOT_PATH_AUDIO = join(FileService.ROOT_PATH, 'audio');
  static ROOT_PATH_AUDIO_TMP = join(FileService.ROOT_PATH_AUDIO, 'tmp');
  static ROOT_PATH_WAVEFORM = join(FileService.ROOT_PATH, 'waveform');

  static getAudioFileName(fileOrId: string, type?: string) {
    return type ? fileOrId + '.' + type : fileOrId;
  }

  static getAudioFilePath(fileOrId: string, type?: string) {
    return join(this.ROOT_PATH_AUDIO, this.getAudioFileName(fileOrId, type));
  }

  static getWaveformFileName(id: string) {
    return id + '-waveform.dat';
  }

  static getWaveformFilePath(id: string) {
    return join(this.ROOT_PATH_WAVEFORM, this.getWaveformFileName(id));
  }

  static generateFileId() {
    return createHash('sha512')
      .update(new Date().getTime() + '' + Math.random())
      .digest('hex')
      .substring(0, 128);
  }

  constructor(
    private readonly prisma: PrismaClient,
    private readonly storageService: StorageService,
    private readonly audiowaveformService: AudiowaveformService,
  ) {}

  private async generateWaveform(audioFile: string, waveformFile: string) {
    return await this.audiowaveformService.generateWaveform(
      audioFile,
      waveformFile,
    );
  }

  private isWaveBuffer(buffer: Buffer) {
    try {
      wav.decode(buffer);
      return true;
    } catch (_) {
      return false;
    }
  }

  private async saveAudioFile(buffer: Buffer) {
    let mp3Id = undefined;
    if (!this.isWaveBuffer(buffer)) {
      mp3Id = FileService.generateFileId();

      const mp3AudioFilePath = FileService.getAudioFilePath(mp3Id, 'mp3');
      if (!existsSync(mp3AudioFilePath))
        writeFileSync(mp3AudioFilePath, buffer);

      await new Mp32Wav(mp3AudioFilePath, FileService.ROOT_PATH_AUDIO_TMP).exec(
        undefined,
      );
      const mp3ToWaveAudioFilePath = join(
        FileService.ROOT_PATH_AUDIO_TMP,
        mp3Id + '.wav',
      );
      buffer = readFileSync(mp3ToWaveAudioFilePath);
      unlinkSync(mp3ToWaveAudioFilePath);
    }

    const waveId = FileService.generateFileId(),
      waveAudioFilePath = FileService.getAudioFilePath(waveId, 'wav'),
      waveformPath = FileService.getWaveformFilePath(waveId);

    let addedWaveAudio = false;
    if (!existsSync(waveAudioFilePath)) {
      writeFileSync(waveAudioFilePath, buffer);
      addedWaveAudio = true;
    }

    let addedWaveform = false;
    if (!existsSync(waveformPath)) {
      await this.generateWaveform(waveAudioFilePath, waveformPath);
      addedWaveform = true;
    }

    return {
      waveId,
      mp3Id,
      addedWaveAudio,
      addedMP3Audio: !!mp3Id,
      addedWaveform,
    };
  }

  private async upload(id: string) {
    const projectId = await this.getProjectIdByFileId(id);
    if (!projectId) return false;

    if (existsSync(FileService.getWaveformFilePath(id)))
      await this.storageService.uploadBuffer(
        ProjectService.getBucketName(projectId),
        FileService.getWaveformFileName(id),
        readFileSync(FileService.getWaveformFilePath(id)),
      );

    if (existsSync(FileService.getAudioFilePath(id, 'wav')))
      await this.storageService.uploadBuffer(
        ProjectService.getBucketName(projectId),
        FileService.getAudioFileName(id, 'wav'),
        readFileSync(FileService.getAudioFilePath(id, 'wav')),
      );
    else if (existsSync(FileService.getAudioFilePath(id, 'mp3')))
      await this.storageService.uploadBuffer(
        ProjectService.getBucketName(projectId),
        FileService.getAudioFileName(id, 'mp3'),
        readFileSync(FileService.getAudioFilePath(id, 'mp3')),
      );

    return true;
  }

  private clear(id: string) {
    for (const path of [
      FileService.getWaveformFilePath(id),
      FileService.getAudioFilePath(id, 'wav'),
      FileService.getAudioFilePath(id, 'mp3'),
    ])
      if (existsSync(path)) unlinkSync(path);
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

  async addAudioFile(versionId: number, buffer: Buffer) {
    const { waveId, mp3Id, addedMP3Audio } = await this.saveAudioFile(buffer);

    if (
      !(
        await this.prisma.tprojectversionfile.findFirst({
          where: {
            id: waveId,
            type: 'wav',
            projectversion_id: versionId,
          },
          select: { projectversion_id: true },
        })
      )?.projectversion_id
    )
      await this.prisma.tprojectversionfile.create({
        data: {
          id: waveId,
          type: 'wav',
          projectversion_id: versionId,
        },
      });

    await this.upload(waveId);
    this.clear(waveId);

    if (
      addedMP3Audio &&
      !(
        await this.prisma.tprojectversionfile.findFirst({
          where: {
            id: mp3Id,
            type: 'mp3',
            projectversion_id: versionId,
          },
          select: { projectversion_id: true },
        })
      )?.projectversion_id
    ) {
      await this.prisma.tprojectversionfile.create({
        data: {
          id: mp3Id,
          type: 'mp3',
          projectversion_id: versionId,
        },
      });

      await this.upload(mp3Id);
      this.clear(mp3Id);
    }

    return { waveId, mp3Id };
  }
}
