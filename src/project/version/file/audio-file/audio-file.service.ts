import { Injectable } from '@nestjs/common';
import * as wav from 'node-wav';
import * as Mp32Wav from 'mp3-to-wav';
import {
  readFileSync,
  unlinkSync,
  writeFileSync,
  mkdirSync,
  rmdirSync,
} from 'fs';
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

  private async saveAudioFile(buffer: Buffer) {
    let mp3Hash: string | undefined;
    if (!this.isWaveBuffer(buffer)) {
      mp3Hash = FileService.generateRandomHash();

      const mp3AudioFilePath = FileService.getFilePathByHash(
        mp3Hash,
        AudioFileService.FILE_TYPE_MP3,
      );
      writeFileSync(mp3AudioFilePath, buffer);

      const mp3ToWaveOutDirPath = FileService.generateTmpPath();
      mkdirSync(mp3ToWaveOutDirPath);

      await new Mp32Wav(mp3AudioFilePath, mp3ToWaveOutDirPath).exec(undefined);
      const mp3ToWaveAudioFilePath = join(
        mp3ToWaveOutDirPath,
        FileService.getFileNameByHash(mp3Hash, AudioFileService.FILE_TYPE_WAVE),
      );
      buffer = readFileSync(mp3ToWaveAudioFilePath);

      unlinkSync(mp3ToWaveAudioFilePath);
      rmdirSync(mp3ToWaveOutDirPath);
    }

    const waveHash = FileService.generateRandomHash(),
      waveAudioFilePath = FileService.getFilePathByHash(
        waveHash,
        AudioFileService.FILE_TYPE_WAVE,
      ),
      waveformPath = FileService.getFilePathByHash(
        waveHash,
        AudioFileService.FILE_TYPE_WAVEFORM,
      );

    writeFileSync(waveAudioFilePath, buffer);
    await this.audiowaveformService.generateWaveform(
      waveAudioFilePath,
      waveformPath,
    );

    return { waveHash, mp3Hash };
  }

  async addAudioFile(versionId: number, file: Express.Multer.File) {
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

    return { waveHash, mp3Hash };
  }
}
