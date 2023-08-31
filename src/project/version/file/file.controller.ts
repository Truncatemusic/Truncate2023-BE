import {Controller, Get, Param, Req, StreamableFile} from '@nestjs/common';
import {AuthService} from "../../../auth/auth.service";
import {FileService} from "./file.service";

@Controller('project/version/file')
export class FileController {
    constructor(
        private readonly service: FileService,
        private readonly authService: AuthService
    ) {}

    @Get('waveformImage/:id')
    async getWaveformImage(@Req() request: Request, @Param('id') id: string) {
        if (!await this.authService.validateSession(request))
            return null
        return this.service.getWaveformImage(id)
    }

    @Get('audio/:type/:id')
    async getAudio(@Req() request: Request, @Param('type') type: string, @Param('id') id: string) {
        if (!await this.authService.validateSession(request))
            return null
        return this.service.getAudio(id, type)
    }
}
