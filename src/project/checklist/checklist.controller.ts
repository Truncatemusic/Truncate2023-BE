import {Body, Controller, Post, Req} from '@nestjs/common';
import {ChecklistService} from "./checklist.service";
import {AuthService} from "../../auth/auth.service";

@Controller('project/checklist')
export class ChecklistController {
    constructor(
        private checklistService: ChecklistService,
        private readonly authService: AuthService
    ) {}

    @Post('entry/add')
    async addEntry(@Req() request: Request, @Body() body: {projectId: number, text: string}) {
        const userId = await this.authService.getUserId(request)
        if (!userId) return AuthService.INVALID_SESSION_RESPONSE

        return await this.checklistService.addEntry(parseInt(String(body.projectId)), userId, body.text);
    }
}
