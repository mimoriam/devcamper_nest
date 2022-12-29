import { Module } from '@nestjs/common';
import { BootcampsService } from './bootcamps.service';
import { BootcampsController } from './bootcamps.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bootcamp } from './entities/bootcamp.entity';
import { CoursesService } from '../courses/courses.service';
import { Course } from '../courses/entities/course.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Bootcamp, Course])],
  controllers: [BootcampsController],
  providers: [BootcampsService, CoursesService],
})
export class BootcampsModule {}
