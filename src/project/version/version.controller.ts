import {Body, Controller, Post, Req} from '@nestjs/common';
import {VersionService} from "./version.service";

@Controller('project/version')
export class VersionController {
    constructor(private readonly service: VersionService) {}

    @Post('create')
    async createVersion(@Req() request: Request, @Body() body: {projectId: number}) {
        const result = await this.service.addVersion(parseInt(String(body.projectId)))
        return result
            ? { success: true, version: result }
            : { success: false }
    }
}
