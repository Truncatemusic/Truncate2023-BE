import {Body, Controller, Post, Patch} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import {randomBytes} from 'crypto';
import * as bcrypt from 'bcrypt';

@Controller('auth')
export class AuthController {
    constructor(private readonly prisma: PrismaClient) {}

    @Post('register')
    async register(@Body() body: { email: string, username: string, password: string }) {
        if (Number.isInteger((await this.prisma.tuser.findFirst({
            where: { email: body.email },
            select: { id: true }
        }))?.id))
            return { success: false, reason: "EMAIL_ALREADY_TAKEN" }

        if (Number.isInteger((await this.prisma.tuser.findFirst({
            where: { username: body.username },
            select: { id: true }
        }))?.id))
            return { success: false, reason: "USERNAME_ALREADY_TAKEN" }

        const result = await this.prisma.tuser.create({
            data: {
                email:    body.email,
                username: body.username,
                password: (await bcrypt.hash(body.password, 10)).toString(),
            }
        });

        if (!Number.isInteger(result?.id))
            return { success: false, reason: "UNKNOWN" }

        return { success: true }
    }

    @Post('login')
    async login(@Body() body: { login: string, password: string }) {
        let user = await this.prisma.tuser.findFirst({
            where: { username: body.login },
            select: { password: true, id: true }
        });

        if (!Number.isInteger(user?.id))
            user = await this.prisma.tuser.findFirst({
                where: { email: body.login },
                select: { password: true, id: true }
            });

        if (!Number.isInteger(user?.id))
            return { success: false, reason: "USER_DOES_NOT_EXIST" }

        if (!await bcrypt.compare(body.password, user.password))
            return { success: false, reason: "PASSWORD_INCORRECT" }

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

    @Patch('updateSession')
    async updateSession(@Body() body: { session: string }) {
        try {
            const session = await this.prisma.tsession.update({
                where: {session: body.session},
                data: {timestamp: new Date()},
                select: { session: true }
            });

            return session?.session
                ? { success: true }
                : { success: false, reason: "UNKNOWN" }
        }
        catch (_) {
            return { success: false, reason: "INVALID_SESSION" }
        }
    }
}