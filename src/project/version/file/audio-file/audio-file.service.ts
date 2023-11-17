import { Injectable } from '@nestjs/common';
import * as wav from 'node-wav';
import * as Mp32Wav from 'mp3-to-wav';
import { readFileSync, unlinkSync, mkdirSync, rmdirSync } from 'fs';
import { join } from 'path';
import { AudiowaveformService } from '../../../../audiowaveform/audiowaveform.service';
import { FileService } from '../file.service';

@Injectable()
export class AudioFileService {
  private static FILE_TYPE_MP3 = 'mp3';
  private static FILE_TYPE_WAVE = 'wav';
  private static FILE_TYPE_WAVEFORM = 'waveform.dat';

  static getWaveformFileName(waveId: string) {
    return FileService.getFileNameByHash(waveId, this.FILE_TYPE_WAVEFORM);
  }

  static evaluateMimeType(file: Express.Multer.File): boolean {
    return file.mimetype.includes('audio/wav');
  }

  constructor(
    private readonly audiowaveformService: AudiowaveformService,
    private readonly fileService: FileService,
  ) {}

  private isWaveBuffer(buffer: Buffer) {
    try {
      wav.decode(buffer);
      return true;
    } catch (_) {
      return false;
    }
  }

  private async saveAudioFile(
    buffer: Buffer,
  ): Promise<{ waveHash: string; mp3Hash?: string }> {
    let mp3Hash: string | undefined;
    if (!this.isWaveBuffer(buffer)) {
      mp3Hash = this.fileService.save(buffer, AudioFileService.FILE_TYPE_MP3);

      const mp3ToWaveOutDirPath = FileService.generateTmpPath();
      mkdirSync(mp3ToWaveOutDirPath);

      await new Mp32Wav(
        FileService.getFilePathByHash(mp3Hash),
        mp3ToWaveOutDirPath,
      ).exec(undefined);
      const mp3ToWaveAudioFilePath = join(
        mp3ToWaveOutDirPath,
        FileService.getFileNameByHash(mp3Hash, AudioFileService.FILE_TYPE_WAVE),
      );
      buffer = readFileSync(mp3ToWaveAudioFilePath);

      unlinkSync(mp3ToWaveAudioFilePath);
      rmdirSync(mp3ToWaveOutDirPath);
    }

    const waveHash = this.fileService.save(
      buffer,
      AudioFileService.FILE_TYPE_WAVE,
    );

    await this.audiowaveformService.generateWaveform(
      FileService.getFilePathByHash(waveHash, AudioFileService.FILE_TYPE_WAVE),
      FileService.getFilePathByHash(
        waveHash,
        AudioFileService.FILE_TYPE_WAVEFORM,
      ),
    );

    return { waveHash, mp3Hash };
  }

  async addAudioFile(
    versionId: number,
    file: Express.Multer.File,
  ): Promise<{
    file: Express.Multer.File;
    waveHash: string;
    mp3Hash?: string;
  }> {
    const { waveHash, mp3Hash } = await this.saveAudioFile(file.buffer);

    if (mp3Hash)
      await this.fileService.addFile(
        versionId,
        waveHash,
        AudioFileService.FILE_TYPE_MP3,
      );

    if (waveHash) {
      const { bucketName } = await this.fileService.addFile(
        versionId,
        waveHash,
        AudioFileService.FILE_TYPE_WAVE,
      );

      await this.fileService.addFile(
        versionId,
        waveHash,
        AudioFileService.FILE_TYPE_WAVEFORM,
        false,
        true,
        bucketName,
      );
    }

    return { file, waveHash, mp3Hash };
  }
}
