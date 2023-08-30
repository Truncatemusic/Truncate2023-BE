import { Controller } from '@nestjs/common';
import {VersionService} from "./version.service";
import {AuthService} from "../../auth/auth.service";

@Controller('project/version')
export class VersionController {
    constructor(
        private readonly service: VersionService,
        private readonly authService: AuthService
    ) {}
}
