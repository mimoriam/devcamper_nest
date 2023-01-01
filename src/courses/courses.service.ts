import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Course } from './entities/course.entity';
import { Repository } from 'typeorm';
import { Bootcamp } from '../bootcamps/entities/bootcamp.entity';
import { paginate, Paginated, PaginateQuery } from 'nestjs-paginate';
import * as fs from 'fs';
import * as path from 'path';
import { ActiveUserData } from '../iam/interfaces/active-user-data.interface';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Bootcamp)
    private readonly bootcampRepo: Repository<Bootcamp>,
    @InjectRepository(Course)
    private readonly courseRepo: Repository<Course>,
  ) {}

  // async findAll(): Promise<Course[]> {
  //   return this.courseRepo.find();
  // }

  async findAll(query: PaginateQuery): Promise<Paginated<Course>> {
    return paginate(query, this.courseRepo, {
      sortableColumns: ['id'],
      nullSort: 'last',
      searchableColumns: [],
      defaultLimit: 2,
      maxLimit: 2,
      relations: ['bootcamp'],
    });
  }

  async findCoursesFromBootcamp(bootcampId: string): Promise<Course[]> {
    return await this.courseRepo
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.bootcamp', 'bootcamp')
      .where('course.bootcamp LIKE :bootcampId', { bootcampId })
      .select()
      .getMany();
  }

  async findOne(id: string): Promise<Course> {
    const course = await this.courseRepo.findOne({
      where: { id: id },
      // relations: ['bootcamp'],
    });

    if (!course) {
      throw new NotFoundException(`Course not found with id of ${id}`);
    }

    return course;
  }

  async create(createCourseDto: CreateCourseDto): Promise<Course> {
    const course = this.courseRepo.create({
      ...createCourseDto,
    });

    return this.courseRepo.save(course);
  }

  async createCourseFromBootcamp(
    bootcampId: string,
    createCourseDto: CreateCourseDto,
    user: ActiveUserData,
  ): Promise<Course> {
    const bootcamp = await this.bootcampRepo.findOneBy({
      id: bootcampId,
    });

    if (!bootcamp) {
      throw new NotFoundException(`Bootcamp #${bootcampId} not found`);
    }

    const course = this.courseRepo.create({
      ...createCourseDto,
    });

    return this.courseRepo.save(course);
  }

  async update(id: string, updateCourseDto: UpdateCourseDto): Promise<Course> {
    const course = await this.courseRepo.preload({
      id: id,
      ...updateCourseDto,
    });

    if (!course) {
      throw new NotFoundException(`Course #${id} not found`);
    }

    return this.courseRepo.save(course);
  }

  async remove(id: string): Promise<Course> {
    const course = await this.courseRepo.findOneBy({
      id: id,
    });

    return this.courseRepo.remove(course);
  }

  async seedUpCourse() {
    const courses = JSON.parse(
      fs.readFileSync(
        `${path.join(__dirname, '../../_data')}/courses.json`,
        'utf-8',
      ),
    );

    const courseEntities = this.courseRepo.create(courses);

    await this.courseRepo
      .createQueryBuilder()
      .insert()
      .into(Course)
      .values(courseEntities)
      .execute();

    return {
      success: true,
      message: 'Courses inserted ~!',
    };
  }

  async seedDownCourse() {
    await this.courseRepo.clear();

    return {
      success: true,
      message: 'Courses deleted !!',
    };
  }
}
