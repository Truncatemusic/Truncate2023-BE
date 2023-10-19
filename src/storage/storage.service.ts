import { Injectable, Scope } from '@nestjs/common';
import { Storage } from '@google-cloud/storage';
import { env } from 'process';

@Injectable({ scope: Scope.DEFAULT })
export class StorageService {
  public readonly storage: Storage;

  constructor() {
    this.storage = new Storage({ keyFilename: env.GOOGLE_STORAGE_KEYFILE });
  }

  uploadBuffer(bucket: string, fileName: string, buffer: Buffer) {
    return new Promise((resolve) => {
      const stream = this.storage
        .bucket(bucket)
        .file(fileName)
        .createWriteStream();

      stream.once('error', (error) => resolve({ success: false, error }));
      stream.once('finish', () => resolve({ success: true }));
      stream.end(buffer);
    });
  }
}
