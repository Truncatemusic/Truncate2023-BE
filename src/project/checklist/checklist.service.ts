import { Injectable } from '@nestjs/common';
import {PrismaClient} from "@prisma/client";

@Injectable()
export class ChecklistService {
    constructor(private readonly prisma: PrismaClient) {}

    async addEntry(projectId: number, userId: number, text: string) {
        try {
            const entry = await this.prisma.tprojectchecklist.create({
                data: {
                    project_id: projectId,
                    user_id: userId,
                    text: text
                }
            })
            return { success: true, id: entry.id }
        } catch (error) {
            return {
                success: false,
                reason: error.meta["field_name"] === "project_id"
                    ? "INVALID_PROJECT"
                    : "UNKNOWN"
            }
        }
    }
}
