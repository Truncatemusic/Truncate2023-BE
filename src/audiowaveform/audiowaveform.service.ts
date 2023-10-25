import { Injectable } from '@nestjs/common';
import { exec, ExecException } from 'child_process';

/**
 * @desc https://github.com/bbc/audiowaveform
 * @package https://github.com/bbc/audiowaveform/releases/download/1.9.1/audiowaveform_1.9.1-1-11_amd64.deb
 */

@Injectable()
export class AudiowaveformService {
  get installed() {
    return new Promise<boolean>((resolve) =>
      exec('audiowaveform -v', (error) => resolve(!error)),
    );
  }

  install(
    distribution: 'debian' | 'ubuntu' | 'macosx' = 'debian',
    ignoreInstalled: boolean = false,
  ) {
    return new Promise<{
      wasInstalled: boolean;
      installedSuccessfully?: boolean;
      error?: ExecException;
      stdout?: string;
    }>(async (resolve) => {
      const installed = await this.installed;
      if (installed && !ignoreInstalled) resolve({ wasInstalled: true });
      else
        exec(
          'npm run install:audiowaveform:' + distribution,
          async (error, stdout) => {
            resolve({
              wasInstalled: installed,
              installedSuccessfully: await this.installed,
              error,
              stdout,
            });
          },
        );
    });
  }

  generateWaveform(audioFile: string, waveformFile: string, bit: 8 | 16 = 8) {
    return new Promise<boolean>((resolve) => {
      exec(
        `audiowaveform -i "${audioFile}" -o "${waveformFile}" -b ${bit}`,
        (error) => resolve(!error),
      );
    });
  }
}
