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
import { ApiTags } from '@nestjs/swagger';

@Controller('api/v1/bootcamps')
@ApiTags('bootcamps')
export class BootcampsController {
  constructor(private readonly bootcampsService: BootcampsService) {}

  @Get()
  async findAll(): Promise<Bootcamp[]> {
    return this.bootcampsService.findAll();
  }

  @Get('/up')
  async seedUpBootcamp() {
    return this.bootcampsService.seedUpBootcamp();
  }

  @Get('/down')
  async seedDownBootcamp() {
    return this.bootcampsService.seedDownBootcamp();
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
