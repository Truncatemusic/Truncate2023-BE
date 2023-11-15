import {
  Controller,
  Param,
  Post,
  Req,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthService } from '../../../../auth/auth.service';
import { StemsService } from './stems.service';
import { VersionService } from '../../version.service';

@Controller('project/version/file/stems')
export class StemsController {
  constructor(
    private readonly service: StemsService,
    private readonly authService: AuthService,
    private readonly versionService: VersionService,
  ) {}

  @Post('upload/:projectId/:versionNumber')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAudioFile(
    @Req() request: Request,
    @UploadedFiles() files: Express.Multer.File[],
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

    await this.service.addStemsParallel(versionId, files);
    return { success: true };
  }
}
