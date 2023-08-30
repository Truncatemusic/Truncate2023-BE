import {Injectable, Param} from '@nestjs/common';
import {PrismaClient} from '@prisma/client';

@Injectable()
export class ProjectService {
    constructor(private readonly prisma: PrismaClient) {}

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

    async createProject(@Param('userId') userId: number, @Param('name') name: string) {
        try {
            const project = await this.prisma.tproject.create({
                data: {
                    name: name
                }
            });

            await this.addVersion(project.id)
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

    async addVersion(@Param('id') projectId: number) {
        const lastVersion = await this.getLastVersions(projectId)
        const version = await this.prisma.tprojectversion.create({
            data: {
                project_id: projectId,
                versionNumber: lastVersion ? lastVersion+1 : 1
            }
        })
        return version.versionNumber
    }

    async getLastVersions(@Param('id') projectId: number) {
        const version = await this.prisma.tprojectversion.groupBy({
            by: ['project_id'],
            where: {
                project_id: projectId
            },
            _max: {
                versionNumber: true
            }
        })

        return version?.[0]
            ? version[0]._max.versionNumber
            : false;
    }
}
