import {Injectable} from '@nestjs/common';
import {PrismaClient} from '@prisma/client';
import {VersionService} from "./version/version.service";
import {UserService} from "../user/user.service";

@Injectable()
export class ProjectService {
    constructor(
        private readonly prisma: PrismaClient,
        private readonly userService: UserService,
        private readonly versionService: VersionService
    ) {}

    async getInfo(id: number) {
        try {
            const project = await this.prisma.tproject.findUnique({
                where: {id: id}
            });

            return !Number.isInteger(project?.id)
                ? { success: false, reason: 'UNKNOWN' }
                : {
                success: true,
                name: project.name
            }
        }
        catch (_) {
            return { success: false, reason: 'UNKNOWN' }
        }
    }

    async createProject(userId: number, name: string, songBPM?: number, songKey?: string) {
        if (!name || !String(name).trim())
            return { success: false, reason: 'INVALID_PROJECT_NAME' }

        try {
            const project = await this.prisma.tproject.create({
                data: { name: name }
            });

            const versionNumber = await this.versionService.addVersion(project.id, songBPM, songKey)
            await this.addUserToProject(project.id, userId, "O")

            return {
                success: true,
                project_id: project.id,
                versionNumber,
                name: project.name,
                songBPM,
                songKey
            }
        }
        catch (_) {
            return { success: false, reason: 'UNKNOWN' }
        }
    }

    async renameProject(id: number, name: string) {
        try {
            await this.prisma.tproject.update({
                where: { id },
                data: { name }
            });

            return { success: true }
        }
        catch (_) {
            return { success: false, reason: 'UNKNOWN' }
        }
    }

    async deleteProject(id: number) {
        try {
            await this.prisma.tprojectuser.deleteMany({
                where: {project_id: id}
            })
            await this.prisma.tproject.delete({
                where: {id}
            })

            return { success: true }
        }
        catch (_) {
            return { success: false, reason: 'UNKNOWN' }
        }
    }

    async addUserToProject(projectId: number, userId: number, role: "O"|"A"|"S") {
        try {
            if (!await this.userService.userExists(userId))
                return { success: false, reason: 'USER_DOES_NOT_EXIST' }

            const projectUserId = (await this.prisma.tprojectuser.findFirst({
                where: {
                    project_id: projectId,
                    user_id: userId
                },
                select: { id: true }
            }))?.id

            if (projectUserId) {
                await this.prisma.tprojectuser.update({
                    where: { id: projectUserId },
                    data: { role }
                })
                return { success: true, action: "UPDATED" }
            }

            await this.prisma.tprojectuser.create({
                data: {
                    project_id: projectId,
                    user_id: userId,
                    role
                }
            })
            return { success: true, action: "ADDED" }
        }
        catch (_) { return {success: false, reason: 'UNKNOWN'} }
    }
}
