import {Injectable, Param} from '@nestjs/common';
import {PrismaClient} from "@prisma/client";

@Injectable()
export class ProjectService {
    constructor(private readonly prisma: PrismaClient) {}

    async getInfo(@Param('id') id: number) {
        try {
            const project = await this.prisma.tproject.findUnique({
                where: {id: id}
            });

            return !Number.isInteger(project?.id)
                ? { success: false, reason: "UNKNOWN" }
                : {
                success: true,
                name: project.name
            }
        }
        catch (_) {
            return { success: false, reason: "UNKNOWN" }
        }
    }

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
}
