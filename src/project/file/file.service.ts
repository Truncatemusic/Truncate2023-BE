import {Injectable} from '@nestjs/common';
import {PrismaClient} from "@prisma/client";

@Injectable()
export class FileService {
    constructor(private readonly prisma: PrismaClient) {}
}
