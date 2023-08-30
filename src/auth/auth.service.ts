import {Injectable, Param, Req} from '@nestjs/common';
import {PrismaClient} from '@prisma/client';
import {randomBytes} from 'crypto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {

    static INVALID_SESSION_RESPONSE = {success: false, reason: 'INVALID_SESSION'}

    constructor(private readonly prisma: PrismaClient) {}

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
            return { success: false, reason: 'UNKNOWN' }
        }
    }

    async getSession(@Param('session') session: string|Request) {
        const result = await this.prisma.tsession.findFirst({where: {
            session: typeof session === 'string' ? session : session['cookies']['session']
        }});

        return {
            session: result?.session,
            user_id: result?.user_id,
        }
    }

    async getUserId(@Param('session') session: string|Request) {
        const result = await this.getSession(session)
        return !result?.session
            ? false
            : result.user_id
    }

    async validateSession(@Req() request: Request) {
        return !!(await this.getSession(request)).session;
    }

    async updateSession(@Param('session') session: string) {
        try {
            const result = await this.prisma.tsession.update({
                where: { session },
                data: { timestamp: new Date() },
                select: { session: true }
            });

            return result?.session
                ? { success: true }
                : { success: false, reason: 'UNKNOWN' }
        }
        catch (_) {
            return { success: false, reason: 'UNKNOWN' }
        }
    }
}
