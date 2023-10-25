import {
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from '../../../auth/auth.service';
import { FileService } from './file.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { VersionService } from '../version.service';
import { StorageService } from '../../../storage/storage.service';
import { Response } from 'express';
import { ProjectService } from '../../project.service';

@Controller('project/version/file')
export class FileController {
  constructor(
    private readonly service: FileService,
    private readonly authService: AuthService,
    private readonly storageService: StorageService,
    private readonly versionService: VersionService,
  ) {}

  @Post('/audio/upload/:projectId/:versionNumber')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAudioFile(
    @Req() request: Request,
    @UploadedFile() file: Express.Multer.File,
    @Param('projectId') projectId: number,
    @Param('versionNumber') versionNumber: number,
  ) {
    if (!(await this.authService.validateSession(request)))
      return AuthService.INVALID_SESSION_RESPONSE;

    const versionId = await this.versionService.getVersionId(
      parseInt(String(projectId)),
      parseInt(String(versionNumber)),
    );
    if (!versionId)
      return { success: false, reason: 'INVALID_PROJECT_OR_VERSION' };

    if (!file.mimetype.includes('audio/wav'))
      return { success: false, reason: 'INVALID_FILE_TYPE' };

    const { waveId } = await this.service.addAudioFile(versionId, file.buffer);
    return { success: true, id: waveId };
  }

  @Get('waveformData/:id')
  async getwaveformData(
    @Req() request: Request,
    @Res() response: Response,
    @Param('id') id: string,
  ) {
    const userId = await this.authService.getUserId(request);
    if (!userId) return response.status(HttpStatus.UNAUTHORIZED).send();

    const { role, file } = await this.service.getUserFileAndRole(id, userId);
    if (!role) return response.status(HttpStatus.UNAUTHORIZED).send();
    if (!file) return response.status(HttpStatus.NOT_FOUND).send();

    await this.storageService.pipeFile(
      response,
      ProjectService.getBucketName(
        await this.service.getProjectIdByFileId(file.id),
      ),
      FileService.getWaveformFileName(file.id),
    );
  }

  @Get('audio/url/:type/:id')
  async getAudioURL(
    @Req() request: Request,
    @Param('type') type: string,
    @Param('id') id: string,
  ) {
    const userId = await this.authService.getUserId(request);
    if (!userId) return AuthService.INVALID_SESSION_RESPONSE;

    const { role, file } = await this.service.getUserFileAndRole(id, userId);
    if (!role) return AuthService.INVALID_SESSION_RESPONSE;
    if (!file) return { success: false, reason: 'RESOURCE_NOT_FOUND' };

    return {
      success: true,
      url: await this.storageService.getFileTmpURL(
        ProjectService.getBucketName(
          await this.service.getProjectIdByFileId(file.id),
        ),
        FileService.getAudioFileName(file.id, type || file.type),
      ),
    };
  }

  @Get('audio/:type/:id')
  async getAudio(
    @Req() request: Request,
    @Res() response: Response,
    @Param('type') type: string,
    @Param('id') id: string,
  ) {
    const userId = await this.authService.getUserId(request);
    if (!userId) return response.status(HttpStatus.UNAUTHORIZED).send();

    const { role, file } = await this.service.getUserFileAndRole(id, userId);
    if (!role) return response.status(HttpStatus.UNAUTHORIZED).send();
    if (!file) return response.status(HttpStatus.NOT_FOUND).send();

    response.redirect(
      await this.storageService.getFileTmpURL(
        ProjectService.getBucketName(
          await this.service.getProjectIdByFileId(file.id),
        ),
        FileService.getAudioFileName(file.id, type || file.type),
      ),
    );
  }
}
