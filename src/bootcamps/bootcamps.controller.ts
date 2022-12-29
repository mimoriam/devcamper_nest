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
import { Paginate, Paginated, PaginateQuery } from 'nestjs-paginate';
import { CreateCourseDto } from '../courses/dto/create-course.dto';
import { Course } from '../courses/entities/course.entity';
import { CoursesService } from '../courses/courses.service';

@Controller('api/v1/bootcamps')
@ApiTags('bootcamps')
export class BootcampsController {
  constructor(
    private readonly bootcampsService: BootcampsService,
    private readonly coursesService: CoursesService,
  ) {}

  // @Get()
  // async findAll(): Promise<Bootcamp[]> {
  //   return this.bootcampsService.findAll();
  // }

  @Get()
  async findAll(
    @Paginate() query: PaginateQuery,
  ): Promise<Paginated<Bootcamp>> {
    return this.bootcampsService.findAll(query);
  }

  @Get(':bootcampId/courses')
  async findCoursesFromBootcamp(
    @Param('bootcampId') bootcampId: string,
  ): Promise<Course[]> {
    return this.coursesService.findCoursesFromBootcamp(bootcampId);
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

  @Post(':bootcampId/courses')
  async createCourseFromBootcamp(
    @Param('bootcampId') bootcampId: string,
    @Body() createCourseDto: CreateCourseDto,
  ): Promise<Course> {
    return this.coursesService.createCourseFromBootcamp(
      bootcampId,
      createCourseDto,
    );
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
