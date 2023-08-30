import {Injectable} from '@nestjs/common';
import {PrismaClient} from "@prisma/client";
import {createHash} from 'crypto';

@Injectable()
export class FileService {

    static generateFileId() {
        return createHash('sha512')
            .update(new Date().getTime().toString())
            .digest('hex')
            .substring(0, 128)
    }

    constructor(private readonly prisma: PrismaClient) {}
}
