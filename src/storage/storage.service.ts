import { Injectable, Scope, HttpStatus } from '@nestjs/common';
import { Storage } from '@google-cloud/storage';
import { env } from 'process';
import { Response } from 'express';
import { join } from 'path';

@Injectable({ scope: Scope.DEFAULT })
export class StorageService {
  static URL_LIFETIME = 60 * 60 * 1e3; // 1h

  private readonly storage: Storage;

  constructor() {
    this.storage = new Storage({
      keyFilename: env.CWD
        ? join(env.CWD, env.GOOGLE_STORAGE_KEYFILE)
        : env.GOOGLE_STORAGE_KEYFILE,
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
    await this.storage.bucket(bucketName).setCorsConfiguration([
      {
        origin: [env.CORS_ORIGIN],
        responseHeader: ['Content-Type'],
        method: ['GET'],
        maxAgeSeconds: StorageService.URL_LIFETIME / 1e3,
      },
    ]);

    const [url] = await this.storage
      .bucket(bucketName)
      .file(fileName)
      .getSignedUrl({
        action: 'read',
        expires: Date.now() + StorageService.URL_LIFETIME,
      });
    return url;
  }

  async pipeFile(response: Response, bucketName: string, fileName: string) {
    try {
      const [file] = await this.storage.bucket(bucketName).file(fileName).get();
      if (!file) response.status(HttpStatus.NOT_FOUND).send();
      else file.createReadStream().pipe(response);
    } catch (e) {
      response.status(HttpStatus.NOT_FOUND).send();
    }
  }
}
