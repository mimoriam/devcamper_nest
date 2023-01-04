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
import { ActiveUserData } from '../iam/interfaces/active-user-data.interface';
import { ActiveUser } from '../iam/decorators/active-user.decorator';

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

  @Auth(AuthType.Bearer)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCourseDto: UpdateCourseDto,
    @ActiveUser() user: ActiveUserData,
  ): Promise<Course> {
    return this.coursesService.update(id, updateCourseDto, user);
  }

  @Auth(AuthType.Bearer)
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @ActiveUser() user: ActiveUserData,
  ): Promise<Course> {
    return this.coursesService.remove(id, user);
  }
}
