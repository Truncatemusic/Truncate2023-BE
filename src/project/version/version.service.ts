import {Injectable, Param} from '@nestjs/common';
import {PrismaClient} from "@prisma/client";

@Injectable()
export class VersionService {
    constructor(private readonly prisma: PrismaClient) {}

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

    async getFiles(@Param('id') projectId: number, @Param('versionNumber') versionNumber: number) {
        const files = await this.prisma.tprojectversionfile.findMany({
            where: {
                tprojectversion: {
                    project_id: projectId,
                    versionNumber: versionNumber
                }
            }
        })
        return files
    }
}
