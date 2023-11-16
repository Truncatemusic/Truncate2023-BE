import {
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthService } from '../../../../auth/auth.service';
import { StemsService } from './stems.service';
import { VersionService } from '../../version.service';
import { ProjectService } from '../../../project.service';

@Controller('project/version/file/stems')
export class StemsController {
  constructor(
    private readonly service: StemsService,
    private readonly authService: AuthService,
    private readonly projectService: ProjectService,
    private readonly versionService: VersionService,
  ) {}

  @Get()
  async getStems(
    @Req() request: Request,
    @Query('projectId') projectId: string,
    @Query('versionNumber') versionNumber: string,
  ) {
    if (
      !(await this.projectService.getUserRoleBySession(
        parseInt(String(projectId)),
        request,
      ))
    )
      return AuthService.INVALID_SESSION_RESPONSE;

    const versionId = await this.versionService.getVersionId(
      parseInt(String(projectId)),
      parseInt(String(versionNumber)),
    );
    if (!versionId) return { success: false, reason: 'UNKNOWN' };

    return {
      success: true,
      stems: (await this.service.getStems(versionId)).map(
        ({ id, name, type, processing }) => ({ id, name, type, processing }),
      ),
    };
  }

  @Post('upload/:projectId/:versionNumber')
  @UseInterceptors(FileInterceptor('file'))
  async uploadStem(
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

    this.service.addStem(versionId, file).then();
    return { success: true };
  }
}
