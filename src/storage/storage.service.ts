import { Injectable, Scope } from '@nestjs/common';
import { Storage } from '@google-cloud/storage';
import { env } from 'process';

@Injectable({ scope: Scope.DEFAULT })
export class StorageService {
  public readonly storage: Storage;

  constructor() {
    this.storage = new Storage({ keyFilename: env.GOOGLE_STORAGE_KEYFILE });
  }
}
