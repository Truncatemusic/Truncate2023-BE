import {Controller, Get, Param, Post, Req, UploadedFile, UseInterceptors} from '@nestjs/common';
import {AuthService} from "../../../auth/auth.service";
import {FileService} from "./file.service";
import {FileInterceptor} from "@nestjs/platform-express";
import {VersionService} from "../version.service";

@Controller('project/version/file')
export class FileController {
    constructor(
        private readonly service: FileService,
        private readonly authService: AuthService,
        private readonly versionService: VersionService
    ) {}

    @Post('/audio/upload/:projectId/:versionNumber')
    @UseInterceptors(FileInterceptor('file'))
    async uploadAudioFile(@Req() request: Request, @UploadedFile() file: Express.Multer.File, @Param('projectId') projectId: number, @Param('versionNumber') versionNumber: number) {
        if (!await this.authService.validateSession(request))
            return AuthService.INVALID_SESSION_RESPONSE

        const versionId = await this.versionService.getVersionId(parseInt(String(projectId)), parseInt(String(versionNumber)))
        if (!versionId)
            return {success: false, reason: 'INVALID_PROJECT_OR_VERSION'}

        if (!file.mimetype.includes("audio/wav"))
            return {success: false, reason: 'INVALID_FILE_TYPE'}

        const {waveId} = await this.service.addAudioFile(versionId, file.buffer)
        return {success: true, id: waveId}
    }

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
