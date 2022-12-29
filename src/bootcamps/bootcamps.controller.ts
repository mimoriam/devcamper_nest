import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { BootcampsService } from './bootcamps.service';
import { CreateBootcampDto } from './dto/create-bootcamp.dto';
import { UpdateBootcampDto } from './dto/update-bootcamp.dto';
import { Bootcamp } from './entities/bootcamp.entity';

@Controller('api/v1/bootcamps')
export class BootcampsController {
  constructor(private readonly bootcampsService: BootcampsService) {}

  @Get()
  async findAll(): Promise<Bootcamp[]> {
    return this.bootcampsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Bootcamp> {
    return this.bootcampsService.findOne(id);
  }

  @Post()
  async create(
    @Body() createBootcampDto: CreateBootcampDto,
  ): Promise<Bootcamp> {
    return this.bootcampsService.create(createBootcampDto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateBootcampDto: UpdateBootcampDto,
  ): Promise<Bootcamp> {
    return this.bootcampsService.update(id, updateBootcampDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<Bootcamp> {
    return this.bootcampsService.remove(id);
  }
}
