import { Controller } from '@nestjs/common';
import {AuthService} from "../../auth/auth.service";
import {FileService} from "./file.service";

@Controller('file')
export class FileController {
    constructor(
        private readonly service: FileService,
        private readonly authService: AuthService
    ) {}
}
