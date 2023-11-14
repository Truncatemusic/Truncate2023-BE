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
    return FileService.getFileName(waveId, this.FILE_TYPE_WAVEFORM);
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
    let mp3Id = undefined;
    if (!this.isWaveBuffer(buffer)) {
      mp3Id = FileService.generateTmpFileId();

      const mp3AudioFilePath = FileService.getFilePath(
        mp3Id,
        AudioFileService.FILE_TYPE_MP3,
      );
      writeFileSync(mp3AudioFilePath, buffer);

      const mp3ToWaveOutDirPath = FileService.generateTmpPath();
      mkdirSync(mp3ToWaveOutDirPath);

      await new Mp32Wav(mp3AudioFilePath, mp3ToWaveOutDirPath).exec(undefined);
      const mp3ToWaveAudioFilePath = join(mp3ToWaveOutDirPath, mp3Id + '.wav');
      buffer = readFileSync(mp3ToWaveAudioFilePath);

      unlinkSync(mp3ToWaveAudioFilePath);
      rmdirSync(mp3ToWaveOutDirPath);
    }

    const waveId = FileService.generateTmpFileId(),
      waveAudioFilePath = FileService.getFilePath(
        waveId,
        AudioFileService.FILE_TYPE_WAVE,
      ),
      waveformPath = FileService.getFilePath(
        waveId,
        AudioFileService.FILE_TYPE_WAVEFORM,
      );

    writeFileSync(waveAudioFilePath, buffer);
    await this.audiowaveformService.generateWaveform(
      waveAudioFilePath,
      waveformPath,
    );

    return { waveId, mp3Id };
  }

  async addAudioFile(versionId: number, buffer: Buffer) {
    const { waveId, mp3Id } = await this.saveAudioFile(buffer);

    if (mp3Id)
      await this.fileService.addFile(
        versionId,
        waveId,
        AudioFileService.FILE_TYPE_MP3,
      );

    if (waveId) {
      const { bucketName } = await this.fileService.addFile(
        versionId,
        waveId,
        AudioFileService.FILE_TYPE_WAVE,
      );

      await this.fileService.addFile(
        versionId,
        waveId,
        AudioFileService.FILE_TYPE_WAVEFORM,
        false,
        true,
        bucketName,
      );
    }

    return { waveId, mp3Id };
  }
}
