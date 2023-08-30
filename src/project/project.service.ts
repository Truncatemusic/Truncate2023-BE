import {Injectable, Param} from '@nestjs/common';
import {PrismaClient} from '@prisma/client';
import {VersionService} from "./version/version.service";

@Injectable()
export class ProjectService {
    constructor(
        private readonly prisma: PrismaClient,
        private readonly versionService: VersionService
    ) {}

    async getInfo(@Param('id') id: number) {
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

    async createProject(@Param('userId') userId: number, @Param('name') name: string, @Param('songBPM') songBPM?: number, @Param('songKey') songKey?: string) {
        try {
            const project = await this.prisma.tproject.create({
                data: {
                    name: name
                }
            });

            await this.versionService.addVersion(project.id, songBPM, songKey)
            await this.addUserToProject(project.id, userId)

            return { success: true, project_id: project.id }
        }
        catch (_) {
            return { success: false, reason: 'UNKNOWN' }
        }
    }

    async renameProject(@Param('id') id: number, @Param('name') name: string) {
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

    async deleteProject(@Param('id') id: number) {
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

    async addUserToProject(@Param('id') projectId: number, @Param('userId') userId: number) {
        await this.prisma.tprojectuser.create({
            data: {
                project_id: projectId,
                user_id: userId,
            }
        })
    }
}
