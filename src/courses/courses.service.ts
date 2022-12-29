import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Course } from './entities/course.entity';
import { Repository } from 'typeorm';
import { Bootcamp } from '../bootcamps/entities/bootcamp.entity';
import { paginate, Paginated, PaginateQuery } from 'nestjs-paginate';

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
}
