import {Injectable, Param} from '@nestjs/common';
import {PrismaClient} from "@prisma/client";

@Injectable()
export class VersionService {
    constructor(private readonly prisma: PrismaClient) {}

    async addVersion(@Param('id') projectId: number, @Param('songBPM') songBPM?: number, @Param('songKey') songKey?: string) {
        const lastVersion = await this.getLastVersionId(projectId)
        const version = await this.prisma.tprojectversion.create({
            data: {
                project_id: projectId,
                versionNumber: lastVersion ? lastVersion+1 : 1,
                songBPM: songBPM || null,
                songKey: songKey || null
            }
        })
        return version.versionNumber
    }

    async getVersionId(@Param('projectId') projectId: number, @Param('versionNumber') versionNumber: number) {
        const result = await this.prisma.tprojectversion.findFirst({
            where: {
                project_id: projectId,
                versionNumber: versionNumber
            },
            select: { id: true }
        })
        return result?.id || false
    }

    async getLastVersionId(@Param('id') projectId: number) {
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

    async getVersion(@Param('id') projectId: number, @Param('versionNumber') versionNumber: number) {
        const result = await this.prisma.tprojectversion.findFirst({
            where: {
                project_id: projectId,
                versionNumber: versionNumber
            }
        })
        return result?.versionNumber
            ? result
            : false
    }

    async getFiles(@Param('versionId') versionId: number) {
        return (await this.prisma.tprojectversionfile.findMany({
            where: {
                projectversion_id: versionId
            }
        }))
    }
}
