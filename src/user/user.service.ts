import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaClient) {}

  private async hashPassword(password: string): Promise<string> {
    return (await bcrypt.hash(password, 10)).toString();
  }

  async register(
    email: string,
    username: string,
    password: string,
    firstname?: string,
    lastname?: string,
  ) {
    if (
      Number.isInteger(
        (
          await this.prisma.tuser.findFirst({
            where: { email: email },
            select: { id: true },
          })
        )?.id,
      )
    )
      return { success: false, reason: 'EMAIL_ALREADY_TAKEN' };

    if (
      Number.isInteger(
        (
          await this.prisma.tuser.findFirst({
            where: { username: username },
            select: { id: true },
          })
        )?.id,
      )
    )
      return { success: false, reason: 'USERNAME_ALREADY_TAKEN' };

    const result = await this.prisma.tuser.create({
      data: {
        email: email,
        username: username,
        password: await this.hashPassword(password),
        firstname: firstname,
        lastname: lastname,
        blocked: true,
        public: true,
      },
    });

    if (!Number.isInteger(result?.id))
      return { success: false, reason: 'UNKNOWN' };

    return { success: true };
  }

  async getUserByEmail(email: string): Promise<number | undefined> {
    return (
      await this.prisma.tuser.findFirst({
        where: { email },
        select: { id: true },
      })
    )?.id;
  }

  async userExists(userId: number) {
    return !!(
      await this.prisma.tuser.findUnique({
        where: { id: userId },
        select: { id: true },
      })
    )?.id;
  }

  async updatePassword(userId: number, password: string): Promise<boolean> {
    try {
      await this.prisma.tuser.update({
        where: {
          id: userId,
        },
        data: {
          password: await this.hashPassword(password),
        },
      });
      return true;
    } catch (_) {
      return false;
    }
  }

  async setPublicStatus(userId: number, isPublic: boolean) {
    await this.prisma.tuser.update({
      where: { id: userId },
      data: { public: isPublic },
    });
  }

  async getInfo(userId: number) {
    const result = await this.prisma.tuser.findFirst({
      where: { id: userId },
      select: {
        email: true,
        username: true,
        firstname: true,
        lastname: true,
        blocked: true,
        public: true,
      },
    });
    return {
      success: true,
      email: result.email,
      username: result.username,
      firstname: result.firstname,
      lastname: result.lastname,
      blocked: result.blocked,
      public: result.public,
    };
  }

  async search(query: string) {
    return (
      await this.prisma.tuser.findMany({
        where: {
          AND: {
            OR: [
              { username: { contains: query } },
              { firstname: { contains: query } },
              { lastname: { contains: query } },
            ],
            public: true,
          },
        },
      })
    ).map(({ id, username, firstname, lastname }) => ({
      id,
      username,
      firstname,
      lastname,
    }));
  }
}
