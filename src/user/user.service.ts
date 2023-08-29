import {Injectable, Param} from '@nestjs/common';
import {PrismaClient} from "@prisma/client";
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
    constructor(private readonly prisma: PrismaClient) {}

    async register(
        @Param('email') email: string,
        @Param('username') username: string,
        @Param('password') password: string,
        @Param('firstname') firstname?: string,
        @Param('firstname') lastname?: string
    ) {
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
                firstname: firstname,
                lastname: lastname
            }
        });

        if (!Number.isInteger(result?.id))
            return { success: false, reason: 'UNKNOWN' }

        return { success: true }
    }

    async getProjects(@Param('userId') userId: number) {
        const projects = await this.prisma.tproject.findMany({
            where: {
                tprojectuser: {
                    some: {
                        user_id: userId,
                    },
                },
            },
        });

        return projects.map(project => ({
            name: project.name
        }))
    }
}
