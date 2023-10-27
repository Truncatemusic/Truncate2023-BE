import { Body, Controller, Get, Post, Patch, Req, Query } from '@nestjs/common';
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
    @Query('projectId') projectId: string,
    @Query('versionNumber') versionNumber: string,
  ) {
    const userRole = await this.projectService.getUserRoleBySession(
      parseInt(String(projectId)),
      request,
    );
    if (!userRole) return AuthService.INVALID_SESSION_RESPONSE;

    const versionId = await this.versionService.getVersionId(
      parseInt(String(projectId)),
      parseInt(String(versionNumber)),
    );

    return versionId
      ? {
          success: true,
          entries: await this.checklistService.getEntries(versionId),
        }
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

  @Patch('entry/uncheck')
  async uncheckEntry(
    @Req() request: Request,
    @Body() body: { projectId: number; versionNumber: number; entryId: number },
  ) {
    const projectId = parseInt(String(body.projectId));
    const versionNumber = parseInt(String(body.versionNumber));

    const userRole = await this.projectService.getUserRoleBySession(
      projectId,
      request,
    );
    if (userRole !== 'O' && userRole !== 'A')
      return AuthService.INVALID_SESSION_RESPONSE;

    const lastVersion = (await this.versionService.getLastVersion(
      projectId,
    )) as { versionNumber: number };
    if (versionNumber !== lastVersion?.versionNumber)
      return { success: false, reason: 'OLD_PROJECT_VERSION' };

    const versionId = await this.versionService.getVersionId(
      projectId,
      versionNumber,
    );

    return versionId
      ? await this.checklistService.uncheckEntry(parseInt(String(body.entryId)))
      : { success: false, reason: 'INVALID_PROJECT_OR_VERSION' };
  }
}
