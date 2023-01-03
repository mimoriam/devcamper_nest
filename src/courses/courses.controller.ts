import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ClassSerializerInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import { CoursesService } from './courses.service';
// import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { ApiTags } from '@nestjs/swagger';
import { Course } from './entities/course.entity';
import { Paginate, Paginated, PaginateQuery } from 'nestjs-paginate';
import { Auth } from '../iam/authentication/decorators/auth.decorator';
import { AuthType } from '../iam/authentication/enums/auth-type.enum';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('api/v1/courses')
@ApiTags('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  // @Get()
  // async findAll(): Promise<Course[]> {
  //   return this.coursesService.findAll();
  // }

  @Auth(AuthType.None)
  @Get()
  async findAll(@Paginate() query: PaginateQuery): Promise<Paginated<Course>> {
    return this.coursesService.findAll(query);
  }

  @Auth(AuthType.None)
  @Get('/up')
  async seedUpCourse() {
    return this.coursesService.seedUpCourse();
  }

  @Auth(AuthType.None)
  @Get('/down')
  async seedDownCourse() {
    return this.coursesService.seedDownCourse();
  }

  @Auth(AuthType.None)
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Course> {
    return this.coursesService.findOne(id);
  }

  // @Post()
  // async create(@Body() createCourseDto: CreateCourseDto): Promise<Course> {
  //   return this.coursesService.create(createCourseDto);
  // }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCourseDto: UpdateCourseDto,
  ): Promise<Course> {
    return this.coursesService.update(id, updateCourseDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<Course> {
    return this.coursesService.remove(id);
  }
}
