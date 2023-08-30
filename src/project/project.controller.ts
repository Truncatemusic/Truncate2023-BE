import {Body, Controller, Get, Patch, Post, Req} from '@nestjs/common';
import {ProjectService} from './project.service';
import {AuthService} from '../auth/auth.service';

@Controller('project')
export class ProjectController {
    constructor(
        private readonly service: ProjectService,
        private readonly authService: AuthService
    ) {}

    @Get('info')
    async getInfo(@Req() request: Request, @Body() body: {id: number}) {
        if (!await this.authService.validateSession(request))
            return AuthService.INVALID_SESSION_RESPONSE

        return await this.service.getInfo(parseInt(String(body.id)));
    }

    @Post('create')
    async create(@Req() request: Request, @Body() body: {name: string, songBPM?: number, songKey?: string}) {
        const userId = await this.authService.getUserId(request)
        if (!userId) return AuthService.INVALID_SESSION_RESPONSE

        return await this.service.createProject(
            userId,
            body.name,
            body.songBPM ? parseInt(String(body.songBPM)) : undefined,
            body.songKey
        );
    }

    @Patch('rename')
    async rename(@Req() request: Request, @Body() body: {id: number, name: string}) {
        if (!await this.authService.validateSession(request))
            return AuthService.INVALID_SESSION_RESPONSE

        return await this.service.renameProject(
            parseInt(String(body.id)),
            body.name
        );
    }

    @Post('delete')
    async delete(@Req() request: Request, @Body() body: {id: number}) {
        if (!await this.authService.validateSession(request))
            return AuthService.INVALID_SESSION_RESPONSE

        return await this.service.deleteProject(parseInt(String(body.id)));
    }
}
