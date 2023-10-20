import { Injectable, Scope } from '@nestjs/common';
import { Storage } from '@google-cloud/storage';
import { env } from 'process';
import { Response } from 'express';
import { join } from 'path';
import { readFileSync } from 'fs';

@Injectable({ scope: Scope.DEFAULT })
export class StorageService {
  private static URL_LIFETIME = 60 * 60 * 1e3; // 1h

  private readonly storage: Storage;

  constructor() {
    this.storage = new Storage({
      credentials: JSON.parse(
        readFileSync(
          env.CWD
            ? join(env.CWD, env.GOOGLE_STORAGE_KEYFILE)
            : env.GOOGLE_STORAGE_KEYFILE,
        ).toString(),
      ),
    });
  }

  async createBucket(name: string) {
    return await this.storage.createBucket(name);
  }

  async deleteBucket(name: string) {
    return await this.storage.bucket(name).delete();
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

  async getFileTmpURL(bucketName: string, fileName: string) {
    const [url] = await this.storage
      .bucket(bucketName)
      .file(fileName)
      .getSignedUrl({
        action: 'read',
        expires: Date.now() + StorageService.URL_LIFETIME,
      });
    return url;
  }

  pipeFile(response: Response, bucketName: string, fileName: string) {
    this.storage
      .bucket(bucketName)
      .file(fileName)
      .createReadStream()
      .pipe(response);
  }
}
