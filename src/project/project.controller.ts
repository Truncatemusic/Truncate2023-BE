import {Body, Controller, Get, Post, Req} from '@nestjs/common';
import {ProjectService} from "./project.service";
import {AuthService} from "../auth/auth.service";

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
    async create(@Req() request: Request, @Body() body: {name: string}) {
        if (!await this.authService.validateSession(request))
            return AuthService.INVALID_SESSION_RESPONSE

        return await this.service.createProject(
            (await this.authService.getSession(request)).user_id,
            body.name
        );
    }

    @Post('rename')
    async rename(@Req() request: Request, @Body() body: {id: number, name: string}) {
        if (!await this.authService.validateSession(request))
            return AuthService.INVALID_SESSION_RESPONSE

        return await this.service.renameProject(
            parseInt(String(body.id)),
            body.name
        );
    }
}
