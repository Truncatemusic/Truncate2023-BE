import { Injectable } from '@nestjs/common';
import {PrismaClient} from "@prisma/client";
import {VersionService} from "../version/version.service";

@Injectable()
export class ChecklistService {
    constructor(
        private readonly prisma: PrismaClient,
        private readonly versionService: VersionService
    ) {}

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

    async getEntries(projectId: number) {
        const entries = await this.prisma.tprojectchecklist.findMany({
            where: {
                project_id: projectId
            },
            select: {
                id: true,
                user_id: true,
                timestamp: true,
                text: true,
                checkedProjectversion_id: true
            }
        })
        const entriesOut = []
        for (const i in entries) {
            entriesOut.push({
                id: entries[i].id,
                user_id: entries[i].user_id,
                timestamp: entries[i].timestamp,
                text: entries[i].text,
                checkedVersionNumber: entries[i].checkedProjectversion_id
                    ? (await this.versionService.getVersionNumber(entries[i].checkedProjectversion_id))?.versionNumber || null
                    : null
            })
        }
        return entriesOut
    }

    async checkEntry(entryId: number, versionId: number) {
        try {
            await this.prisma.tprojectchecklist.update({
                where: { id: entryId },
                data: { checkedProjectversion_id: versionId }
            })
            return { success: true }
        }
        catch(_) { return { success: false, reason: "UNKNOWN" } }
    }

    async uncheckEntry(entryId: number) {
        try {
            await this.prisma.tprojectchecklist.update({
                where: { id: entryId },
                data: { checkedProjectversion_id: null }
            })
            return { success: true }
        }
        catch(_) { return { success: false, reason: "UNKNOWN" } }
    }
}