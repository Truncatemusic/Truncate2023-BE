import {Body, Controller, Get, Post, Req} from '@nestjs/common';
import {VersionService} from "./version.service";
import {AuthService} from "../../auth/auth.service";

@Controller('project/version')
export class VersionController {
    constructor(
        private readonly service: VersionService,
        private readonly authService: AuthService
    ) {}

    @Post('create')
    async createVersion(@Req() request: Request, @Body() body: {projectId: number}) {
        if (!await this.authService.validateSession(request))
            return AuthService.INVALID_SESSION_RESPONSE

        const result = await this.service.addVersion(parseInt(String(body.projectId)))
        return result
            ? {success: true, version: result}
            : {success: false, reason: "UNKNOWN"}
    }

    @Get('last')
    async getLastVersions(@Req() request: Request, @Body() body: {projectId: number}) {
        if (!await this.authService.validateSession(request))
            return AuthService.INVALID_SESSION_RESPONSE

        const projectId = parseInt(String(body.projectId)),
              lastVersionId = await this.service.getLastVersionId(projectId)

        if (!lastVersionId)
            return { success: false, reason: "INVALID_PROJECT" }

        const lastVersion = await this.service.getVersion(projectId, lastVersionId)
        return lastVersion
            ? {
                success:       true,
                versionNumber: lastVersion.versionNumber,
                timestamp:     lastVersion.timestamp,
                songBPM:       lastVersion.songBPM,
                songKey:       lastVersion.songKey
            }
            : { success: false, reason: "UNKNOWN" }
    }

    @Get('files')
    async getFiles(@Req() request: Request, @Body() body: {projectId: number, versionNumber: number}) {
        if (!await this.authService.validateSession(request))
            return AuthService.INVALID_SESSION_RESPONSE

        const versionId = await this.service.getVersionId(parseInt(String(body.projectId)), parseInt(String(body.versionNumber)))
        if (!versionId)
            return {success: false, reason: 'INVALID_PROJECT_OR_VERSION'}

        return (await this.service.getFiles(versionId)).map(file => ({
            id:   file.id,
            type: file.type
        }))
    }
}
