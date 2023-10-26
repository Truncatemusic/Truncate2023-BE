import { Body, Controller, Get, Post, Patch, Req } from '@nestjs/common';
import { ChecklistService } from './checklist.service';
import { AuthService } from '../../auth/auth.service';
import { ProjectService } from '../project.service';
import { VersionService } from '../version/version.service';

@Controller('project/checklist')
export class ChecklistController {
  constructor(
    private readonly checklistService: ChecklistService,
    private readonly authService: AuthService,
    private readonly projectService: ProjectService,
    private readonly versionService: VersionService,
  ) {}

  @Get('entries')
  async getEntries(
    @Req() request: Request,
    @Body() body: { projectId: number; versionNumber: number },
  ) {
    const userRole = await this.projectService.getUserRoleBySession(
      parseInt(String(body.projectId)),
      request,
    );
    if (!userRole) return AuthService.INVALID_SESSION_RESPONSE;

    const versionId = await this.versionService.getVersionId(
      body.projectId,
      body.versionNumber,
    );

    return versionId
      ? await this.checklistService.getEntries(versionId)
      : { success: false, reason: 'INVALID_PROJECT_OR_VERSION' };
  }

  @Post('entry/add')
  async addEntry(
    @Req() request: Request,
    @Body() body: { projectId: number; versionNumber: number; text: string },
  ) {
    const userRole = await this.projectService.getUserRoleBySession(
      parseInt(String(body.projectId)),
      request,
    );
    if (userRole !== 'O' && userRole !== 'A')
      return AuthService.INVALID_SESSION_RESPONSE;

    const userId = await this.authService.getUserId(request);
    if (!userId) return AuthService.INVALID_SESSION_RESPONSE;

    const versionId = await this.versionService.getVersionId(
      body.projectId,
      body.versionNumber,
    );

    return versionId
      ? await this.checklistService.addEntry(versionId, userId, body.text)
      : { success: false, reason: 'INVALID_PROJECT_OR_VERSION' };
  }

  @Patch('entry/check')
  async checkEntry(
    @Req() request: Request,
    @Body() body: { projectId: number; versionNumber: number; entryId: number },
  ) {
    const userRole = await this.projectService.getUserRoleBySession(
      parseInt(String(body.projectId)),
      request,
    );
    if (userRole !== 'O' && userRole !== 'A')
      return AuthService.INVALID_SESSION_RESPONSE;

    const versionId = await this.versionService.getVersionId(
      parseInt(String(body.projectId)),
      parseInt(String(body.versionNumber)),
    );

    return versionId
      ? await this.checklistService.checkEntry(
          parseInt(String(body.entryId)),
          versionId,
        )
      : { success: false, reason: 'INVALID_PROJECT_OR_VERSION' };
  }
}
