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
            : {success: false}
    }

    @Get('files')
    async getFiles(@Req() request: Request, @Body() body: {projectId: number, versionNumber: number}) {
        if (!await this.authService.validateSession(request))
            return AuthService.INVALID_SESSION_RESPONSE

        const result = await this.service.getFiles(parseInt(String(body.projectId)), parseInt(String(body.versionNumber)))
        return result
    }
}
