import { Controller, Get, Param } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Controller('test')
export class TestController {
  constructor(private readonly prisma: PrismaClient) {}

  @Get(':id')
  async getConnect(@Param('id') id: string) {
    const parsedId = parseInt(id, 10); // Parse the id as an integer

    if (isNaN(parsedId)) {
      return { message: 'Invalid id' };
    }

    const connectEntry = await this.prisma.connect.findUnique({
      where: { id: parsedId },
    });

    if (!connectEntry) {
      return { message: 'Entry not found' };
    }

    return {
      id: connectEntry.id,
      user: connectEntry.user,
    };
  }
}
