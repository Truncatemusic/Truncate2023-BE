import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import Handlebars from 'handlebars';
import * as process from 'process';
import { readFileSync } from 'fs';
import { join } from 'path';

@Injectable()
export class MailService {
  static readonly DIR = join(
    process.env.CWD || process.cwd(),
    '/template/mail',
  );

  constructor(private readonly mailerService: MailerService) {}

  async sendMail(
    to: string,
    subject: string,
    template: string,
    param: object = {},
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

          css: readFileSync(MailService.DIR + '/css/style.css').toString(),

          subject,
          template,
        },
      });
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  }
}
