import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { FileService } from '../file.service';

@Injectable()
export class StemsService {
  private static FILE_TYPE_STEM = 'stm';

  private static typeFromFile(file: Express.Multer.File) {
    if (file.mimetype.includes('audio/wav')) return 'wav';
    if (file.mimetype.includes('audio/aiff')) return 'aif';
    if (file.mimetype.includes('audio/mp3')) return 'mp3';
  }

  constructor(
    private readonly prisma: PrismaClient,
    private readonly fileService: FileService,
  ) {}

  async addStem(
    versionId: number,
    file: Express.Multer.File,
  ): Promise<
    | { success: true; stem: object; hash: string; file: Express.Multer.File }
    | { success: false; reason: string }
  > {
    const stemGroup = await this.getCreateDefaultGroup(versionId);

    const { hash } = await this.fileService.addFile(
      versionId,
      file.buffer,
      StemsService.FILE_TYPE_STEM,
    );

    const fileEntry = await this.fileService.getFileByHash(hash);
    if (!fileEntry)
      return { success: false, reason: 'FILE_COULD_NOT_BE_INSERTED' };

    const stem = await this.insertStem(
      fileEntry.id,
      stemGroup.id,
      file.filename || file.originalname,
      StemsService.typeFromFile(file),
    );
    if (!stem) return { success: false, reason: 'STEM_COULD_NOT_BE_INSERTED' };

    return { success: true, stem, hash, file };
  }

  async getDefaultGroupByVersionId(versionId: number) {
    return this.prisma.tprojectversionstemsgroup.findFirst({
      where: {
        projectversion_id: versionId,
        name: null,
      },
    });
  }

  async createGroup(versionId: number, name: string | null) {
    return this.prisma.tprojectversionstemsgroup.create({
      data: {
        projectversion_id: versionId,
        name,
      },
    });
  }

  async createDefaultGroup(versionId: number) {
    return await this.createGroup(versionId, null);
  }

  async getCreateDefaultGroup(versionId: number) {
    const stemsGroup = await this.getDefaultGroupByVersionId(versionId);
    return stemsGroup || (await this.createDefaultGroup(versionId));
  }

  async getStems(versionId: number) {
    return this.prisma.tprojectversionstems.findMany({
      where: {
        tprojectversionfile: {
          projectversion_id: versionId,
        },
      },
    });
  }

  private async insertStem(
    fileId: number,
    groupId: number,
    name: string,
    type: string,
  ) {
    return this.prisma.tprojectversionstems.create({
      data: {
        projectversionfile_id: fileId,
        projectversionstemgroup_id: groupId,
        name,
        type,
      },
    });
  }
}
