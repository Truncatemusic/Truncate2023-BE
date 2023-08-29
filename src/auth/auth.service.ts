import { Injectable, Param } from '@nestjs/common';
import {PrismaClient} from '@prisma/client';
import {randomBytes} from 'crypto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(private readonly prisma: PrismaClient) {}

    async register(@Param('email') email: string, @Param('username') username: string, @Param('password') password: string) {
        if (Number.isInteger((await this.prisma.tuser.findFirst({
            where: { email: email },
            select: { id: true }
        }))?.id))
            return { success: false, reason: 'EMAIL_ALREADY_TAKEN' }

        if (Number.isInteger((await this.prisma.tuser.findFirst({
            where: { username: username },
            select: { id: true }
        }))?.id))
            return { success: false, reason: 'USERNAME_ALREADY_TAKEN' }

        const result = await this.prisma.tuser.create({
            data: {
                email:    email,
                username: username,
                password: (await bcrypt.hash(password, 10)).toString(),
            }
        });

        if (!Number.isInteger(result?.id))
            return { success: false, reason: 'UNKNOWN' }

        return { success: true }
    }

    async login(@Param('login') login: string, @Param('password') password: string) {
        let user = await this.prisma.tuser.findFirst({
            where: { username: login },
            select: { password: true, id: true }
        });

        if (!Number.isInteger(user?.id))
            user = await this.prisma.tuser.findFirst({
                where: { email: login },
                select: { password: true, id: true }
            });

        if (!Number.isInteger(user?.id))
            return { success: false, reason: 'USER_DOES_NOT_EXIST' }

        if (!await bcrypt.compare(password, user.password))
            return { success: false, reason: 'PASSWORD_INCORRECT' }

        let session = (await this.prisma.tsession.findFirst({
            where: { user_id: user.id },
            select: { session: true }
        }))?.session;

        if (!session) {
            session = randomBytes(32).toString('hex')
            await this.prisma.tsession.create({
                data: {
                    user_id: user.id,
                    session,
                },
            });
        }

        return { success: true, session };
    }

    async logout(@Param('session') session: string) {
        try {
            const result = await this.prisma.tsession.delete({
                where: { session },
                select: { session: true }
            });

            return result?.session
                ? { success: true }
                : { success: false, reason: 'UNKNOWN' }
        }
        catch (_) {
            return { success: false, reason: 'INVALID_SESSION' }
        }
    }

    async updateSession(@Param('session') session: string) {
        try {
            const result = await this.prisma.tsession.update({
                where: { session: session },
                data: { timestamp: new Date() },
                select: { session: true }
            });

            return result?.session
                ? { success: true }
                : { success: false, reason: 'UNKNOWN' }
        }
        catch (_) {
            return { success: false, reason: 'INVALID_SESSION' }
        }
    }
}
