import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import Handlebars from 'handlebars';
import * as process from 'process';
import { existsSync, readFileSync } from 'fs';

@Injectable()
export class MailService {
  static readonly DIR = process.cwd() + '/template/mail';

  constructor(private readonly mailerService: MailerService) {}

  async sendMail(
    to: string,
    subject: string,
    title: string,
    template: string,
    param: object = {},
    theme: string = 'light',
  ) {
    try {
      await this.mailerService.sendMail({
        to,
        subject,
        template: 'index.hbs',
        context: {
          header: Handlebars.compile(
            readFileSync(MailService.DIR + '/partials/header.hbs').toString(),
            {},
          ),

          footer: Handlebars.compile(
            readFileSync(MailService.DIR + '/partials/footer.hbs').toString(),
          )({}),

          body: Handlebars.compile(
            readFileSync(
              MailService.DIR + '/templates/' + template + '.hbs',
            ).toString(),
          )(param),

          css:
            readFileSync(
              MailService.DIR + '/css/themes/' + theme + '.css',
            ).toString() +
            readFileSync(MailService.DIR + '/css/style.css').toString() +
            readFileSync(
              MailService.DIR + '/css/partials/header.css',
            ).toString() +
            readFileSync(
              MailService.DIR + '/css/partials/main.css',
            ).toString() +
            readFileSync(
              MailService.DIR + '/css/partials/footer.css',
            ).toString() +
            (existsSync(MailService.DIR + '/css/templates/' + template + '.css')
              ? readFileSync(
                  MailService.DIR + '/css/templates/' + template + '.css',
                ).toString()
              : ''),

          title,
        },
      });
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  }
}
