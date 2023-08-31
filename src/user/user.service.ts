import {Injectable} from '@nestjs/common';
import {PrismaClient} from '@prisma/client';
import * as bcrypt from 'bcrypt';
import {VersionService} from "../project/version/version.service";

@Injectable()
export class UserService {
    constructor(
        private readonly prisma: PrismaClient,
        private readonly versionService: VersionService
    ) {}

    async register(email: string, username: string, password: string, firstname?: string, lastname?: string) {
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

    async getInfo(userId: number) {
        const {email, username, firstname, lastname} = await this.prisma.tuser.findFirst({
            where: { id: userId },
            select: {
                email: true,
                username: true,
                firstname: true,
                lastname: true
            }
        })
        return {
            success: true,
            email, username,
            firstname, lastname
        }
    }

    async getProjects(userId: number) {
        const projectResults = await this.prisma.tproject.findMany({
            where: {
                tprojectuser: {
                    some: {
                        user_id: userId,
                    },
                },
            },
        })

        const projects = []
        for (const project of projectResults) {
            const version = await this.versionService.getLastVersion(project.id)
            if (!version) continue

            projects.push({
                id: project.id,
                name: project.name,
                lastVersion: {
                    versionNumber: version.versionNumber,
                    timestamp: version.timestamp,
                    songBPM: version.songBPM,
                    songKey: version.songKey
                }
            })
        }
        return projects
    }
}
