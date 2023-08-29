import { Injectable } from '@nestjs/common';
import {PrismaClient} from "@prisma/client";

@Injectable()
export class ProjectService {
    constructor(private readonly prisma: PrismaClient) {}
}
