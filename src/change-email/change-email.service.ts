import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { createHash } from 'crypto';

@Injectable()
export class ChangeEmailService {
  constructor(private readonly prisma: PrismaClient) {}

  private get randomResetKey(): string {
    return createHash('md5')
      .update(Math.random() + '.' + new Date().getTime())
      .digest('hex');
  }

  private get latestTimestamp(): Date {
    const timestamp = new Date();
    timestamp.setHours(timestamp.getHours() - 1);
    return timestamp;
  }

  private async deleteExpiredResetKeys(): Promise<void> {
    await this.prisma.tuserchangeemail.deleteMany({
      where: { timestamp: { lt: this.latestTimestamp } },
    });
  }

  async addResetKey(user_id: number, email: string): Promise<string> {
    const { resetKey } = await this.prisma.tuserchangeemail.create({
      data: { user_id, resetKey: this.randomResetKey, email },
      select: { resetKey: true },
    });

    return resetKey;
  }

  async evaluateResetKey(
    key: string,
  ): Promise<{ user_id: number; email: string } | null> {
    await this.deleteExpiredResetKeys();

    let result: { user_id: number; email: string } | undefined;
    try {
      result = await this.prisma.tuserchangeemail.delete({
        where: { resetKey: key },
        select: {
          user_id: true,
          email: true,
        },
      });
    } catch (_) {
      return null;
    }

    return result || null;
  }
}
