import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
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
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Request } from 'express';
import { Auth } from '../iam/authentication/decorators/auth.decrator';
import { AuthType } from '../iam/authentication/enums/auth-type.enum';
import { ActiveUser } from '../iam/decorators/active-user.decorator';
import { ActiveUserData } from '../iam/interfaces/active-user-data.interface';

// Note: To get the token in the controller, use: @ActiveUser() user: ActiveUserData
// Note: To get the req.user in service, use Scopes:
// https://stackoverflow.com/questions/54979729/howto-get-req-user-in-services-in-nest-js

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

  @Auth(AuthType.None)
  @Get()
  async findAll(
    @Paginate() query: PaginateQuery,
  ): Promise<Paginated<Bootcamp>> {
    return this.bootcampsService.findAll(query);
  }

  @Auth(AuthType.None)
  @Get(':bootcampId/courses')
  async findCoursesFromBootcamp(
    @Param('bootcampId') bootcampId: string,
  ): Promise<Course[]> {
    return this.coursesService.findCoursesFromBootcamp(bootcampId);
  }

  @Auth(AuthType.Bearer)
  @Get('/up')
  async seedUpBootcamp(@ActiveUser() user: ActiveUserData) {
    console.log(user);
    return this.bootcampsService.seedUpBootcamp(user);
  }

  @Auth(AuthType.Bearer)
  @Get('/down')
  async seedDownBootcamp(@ActiveUser() user: ActiveUserData) {
    return this.bootcampsService.seedDownBootcamp(user);
  }

  @Auth(AuthType.Bearer)
  @Post(':bootcampId/multer')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/',
        filename(req: Request, file: Express.Multer.File, callback) {
          const ext = file.mimetype.split('/')[1];
          callback(null, `user-${req.params.bootcampId}-${Date.now()}.${ext}`);
        },
      }),
      limits: {
        files: 1,
        fileSize: 5 * 10 * 10 * 10 * 10 * 10 * 10, // 5 mb in bytes
      },
      fileFilter(req: Request, file: Express.Multer.File, callback) {
        if (file.mimetype.startsWith('image')) {
          callback(null, true);
        } else {
          callback(new Error(`Please upload an image file`), false);
        }
      },
    }),
  )
  async uploadFile(
    @Param('bootcampId') bootcampId: string,
    @UploadedFile()
    file: Express.Multer.File,
    @ActiveUser() user: ActiveUserData,
  ): Promise<Bootcamp> {
    return this.bootcampsService.uploadFile(bootcampId, file, user);
  }

  @Auth(AuthType.Bearer)
  @Patch(':bootcampId/removeMulter')
  async deleteUpload(
    @Param('bootcampId') bootcampId: string,
    @ActiveUser() user: ActiveUserData,
  ) {
    return this.bootcampsService.deleteUpload(bootcampId, user);
  }

  @Auth(AuthType.None)
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Bootcamp> {
    return this.bootcampsService.findOne(id);
  }

  @Auth(AuthType.Bearer)
  @Post()
  async create(
    @Body() createBootcampDto: CreateBootcampDto,
    @ActiveUser() user: ActiveUserData,
  ): Promise<Bootcamp> {
    return this.bootcampsService.create(createBootcampDto, user);
  }

  @Auth(AuthType.Bearer)
  @Post(':bootcampId/courses')
  async createCourseFromBootcamp(
    @Param('bootcampId') bootcampId: string,
    @Body() createCourseDto: CreateCourseDto,
    @ActiveUser() user: ActiveUserData,
  ): Promise<Course> {
    return this.coursesService.createCourseFromBootcamp(
      bootcampId,
      createCourseDto,
      user,
    );
  }

  @Auth(AuthType.Bearer)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateBootcampDto: UpdateBootcampDto,
    @ActiveUser() user: ActiveUserData,
  ): Promise<Bootcamp> {
    return this.bootcampsService.update(id, updateBootcampDto, user);
  }

  @Auth(AuthType.Bearer)
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @ActiveUser() user: ActiveUserData,
  ): Promise<Bootcamp> {
    return this.bootcampsService.remove(id, user);
  }
}
