import { Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';

@Injectable()
export class TranslationService {
  readonly DIR = '../assets/i18n';
  readonly LANGUAGES = ['en'];

  private translations: object[] = [];

  constructor() {
    this.parseTranslations();
  }

  private getTranslationFile(language: string): string {
    return join(this.DIR, language + '.json');
  }

  private parseTranslationFile(language: string): object {
    return JSON.parse(
      readFileSync(this.getTranslationFile(language)).toString(),
    );
  }

  parseTranslations() {
    for (const language of this.LANGUAGES)
      this.translations[language] = this.parseTranslationFile(language);
  }

  getTranslation(language: string): object {
    return this.translations[language];
  }
}
