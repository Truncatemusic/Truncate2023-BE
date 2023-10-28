import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { VersionService } from '../version/version.service';

@Injectable()
export class ChecklistService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly versionService: VersionService,
  ) {}

  async addEntry(projectversionId: number, userId: number, text: string) {
    try {
      const entry = await this.prisma.tprojectchecklist.create({
        data: {
          projectversionId: projectversionId,
          user_id: userId,
          text: text,
        },
      });
      return { success: true, id: entry.id };
    } catch (error) {
      return { success: false, reason: 'UNKNOWN' };
    }
  }

  async getEntries(
    projectversionId: number,
    checked: boolean | undefined = undefined,
    includeOlder: boolean = false,
  ) {
    const entries = await this.prisma.tprojectchecklist.findMany({
      where: {
        projectversionId: includeOlder
          ? { lte: projectversionId }
          : projectversionId,
        ...(checked !== undefined
          ? {
              checkedProjectversion_id: checked
                ? {
                    not: {
                      equals: null,
                    },
                  }
                : null,
            }
          : {}),
      },
      select: {
        id: true,
        user_id: true,
        timestamp: true,
        text: true,
        checkedProjectversion_id: true,
        rejected: true,
      },
    });

    const entriesOut = [];
    // using for-loop instead of 'Array.map', because 'versionService.getVersionNumber' is async
    for (const i in entries) {
      entriesOut.push({
        id: entries[i].id,
        user_id: entries[i].user_id,
        timestamp: entries[i].timestamp,
        text: entries[i].text,
        checkedVersionNumber: entries[i].checkedProjectversion_id
          ? (
              await this.versionService.getVersionNumber(
                entries[i].checkedProjectversion_id,
              )
            )?.versionNumber || null
          : null,
        rejected: entries[i].rejected,
      });
    }
    return entriesOut;
  }

  async checkEntry(
    entryId: number,
    versionId: number,
    rejected: boolean = false,
  ) {
    try {
      await this.prisma.tprojectchecklist.update({
        where: { id: entryId },
        data: {
          checkedProjectversion_id: versionId,
          rejected,
        },
      });
      return { success: true };
    } catch (_) {
      return { success: false, reason: 'UNKNOWN' };
    }
  }

  async uncheckEntry(entryId: number) {
    try {
      await this.prisma.tprojectchecklist.update({
        where: { id: entryId },
        data: {
          checkedProjectversion_id: null,
          rejected: null,
        },
      });
      return { success: true };
    } catch (_) {
      return { success: false, reason: 'UNKNOWN' };
    }
  }
}
