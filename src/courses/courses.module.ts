import { Module } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course, CourseSubscriber } from './entities/course.entity';
import { Bootcamp } from '../bootcamps/entities/bootcamp.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Course, Bootcamp])],
  controllers: [CoursesController],
  providers: [CoursesService, CourseSubscriber],
})
export class CoursesModule {}
