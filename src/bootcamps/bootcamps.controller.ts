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

@Controller('bootcamps')
export class BootcampsController {
  constructor(private readonly bootcampsService: BootcampsService) {}

  @Post()
  create(@Body() createBootcampDto: CreateBootcampDto) {
    return this.bootcampsService.create(createBootcampDto);
  }

  @Get()
  findAll() {
    return this.bootcampsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bootcampsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateBootcampDto: UpdateBootcampDto,
  ) {
    return this.bootcampsService.update(+id, updateBootcampDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bootcampsService.remove(+id);
  }
}
