import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
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
import { RoleType } from '../users/entities/user.entity';

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
    // return paginate(query, this.courseRepo, {
    //   sortableColumns: ['id'],
    //   nullSort: 'last',
    //   searchableColumns: [],
    //   defaultLimit: 2,
    //   maxLimit: 2,
    //   relations: ['bootcamp', 'user'],
    //   select: [],
    // });

    const qb = this.courseRepo
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.bootcamp', 'bootcamp')
      .select(['course', 'bootcamp.id', 'bootcamp.name']);

    return await paginate(query, qb, {
      sortableColumns: ['id'],
      nullSort: 'last',
      searchableColumns: [],
      defaultLimit: 2,
      maxLimit: 2,
    });
  }

  async findCoursesFromBootcamp(bootcampId: string): Promise<Course[]> {
    return await this.courseRepo
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.bootcamp', 'bootcamp')
      .where('course.bootcamp LIKE :bootcampId', { bootcampId })
      .select(['course', 'bootcamp.id', 'bootcamp.name'])
      .getMany();
  }

  async findOne(id: string): Promise<Course> {
    // const course = await this.courseRepo.findOne({
    //   where: { id: id },
    // });

    const course = await this.courseRepo
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.bootcamp', 'bootcamp')
      .where('course.id LIKE :courseId', { courseId: id })
      .select(['course', 'bootcamp.id', 'bootcamp.name'])
      .getOne();

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
    const bootcamp = await this.bootcampRepo.findOne({
      relations: {
        user: true,
      },
      where: {
        id: bootcampId,
      },
    });

    if (!bootcamp) {
      throw new NotFoundException(`Bootcamp #${bootcampId} not found`);
    }

    // Make sure user is bootcamp owner:
    if (
      bootcamp.user.id !== user.sub.toString() &&
      user.role !== RoleType.ADMIN
    ) {
      throw new UnauthorizedException();
    }

    const course = this.courseRepo.create({
      ...createCourseDto,
    });

    return this.courseRepo.save(course);
  }

  async update(
    id: string,
    updateCourseDto: UpdateCourseDto,
    user: ActiveUserData,
  ): Promise<Course> {
    const course = await this.courseRepo.preload({
      id: id,
      ...updateCourseDto,
    });

    if (!course) {
      throw new NotFoundException(`Course #${id} not found`);
    }

    const courseFound = await this.courseRepo.findOne({
      relations: {
        user: true,
      },
      where: {
        id: id,
      },
    });

    // Make sure user is "COURSE" owner:
    // The same is for remove method below, copy & paste:
    if (
      courseFound.user.id !== user.sub.toString() &&
      user.role !== RoleType.ADMIN
    ) {
      throw new UnauthorizedException();
    }

    return this.courseRepo.save(course);
  }

  async remove(id: string, user: ActiveUserData): Promise<Course> {
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
