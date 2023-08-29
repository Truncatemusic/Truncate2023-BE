import {Injectable, Param} from '@nestjs/common';
import {PrismaClient} from "@prisma/client";

@Injectable()
export class ProjectService {
    constructor(private readonly prisma: PrismaClient) {}

    async createProject(@Param('userId') userId: number, @Param('name') name: string) {
        try {
            const project = await this.prisma.tproject.create({
                data: {
                    name: name
                }
            });

            await this.prisma.tprojectuser.create({
                data: {
                    user_id: userId,
                    project_id: project.id,
                }
            })

            return { success: true, project_id: project.id }
        }
        catch (_) {
            return { success: false, reason: "UNKNOWN" }
        }
    }

    async renameProject(@Param('id') id: number|string, @Param('name') name: string) {
        try {
            await this.prisma.tproject.update({
                where: { id: parseInt(String(id)) },
                data: { name }
            });

            return { success: true }
        }
        catch (_) {
            return { success: false, reason: 'UNKNOWN' }
        }
    }
}
