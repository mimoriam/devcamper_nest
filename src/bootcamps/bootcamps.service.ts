import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateBootcampDto } from './dto/create-bootcamp.dto';
import { UpdateBootcampDto } from './dto/update-bootcamp.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Bootcamp } from './entities/bootcamp.entity';
import { Repository } from 'typeorm';
import * as path from 'path';
import * as fs from 'fs';
import { paginate, Paginated, PaginateQuery } from 'nestjs-paginate';
import { ActiveUserData } from '../iam/interfaces/active-user-data.interface';
import { RoleType } from '../users/entities/user.entity';

@Injectable()
export class BootcampsService {
  constructor(
    @InjectRepository(Bootcamp)
    private readonly bootcampRepo: Repository<Bootcamp>,
  ) {}

  // async findAll(): Promise<Bootcamp[]> {
  //   return this.bootcampRepo.find();
  // }

  async findAll(query: PaginateQuery): Promise<Paginated<Bootcamp>> {
    return paginate(query, this.bootcampRepo, {
      relations: ['courses'],
      sortableColumns: ['id', 'name'],
      nullSort: 'last',
      searchableColumns: ['name'],
      defaultLimit: 2,
      maxLimit: 2,
    });
  }

  async uploadFile(
    bootcampId: string,
    file: Express.Multer.File,
    user: ActiveUserData,
  ): Promise<Bootcamp> {
    const bootcamp = await this.bootcampRepo.preload({
      id: bootcampId,
      photo: file.filename,
    });

    if (!bootcamp) {
      throw new NotFoundException(`Bootcamp #${bootcampId} not found`);
    }

    return this.bootcampRepo.save(bootcamp);
  }

  async deleteUpload(bootcampId: string, user: ActiveUserData) {
    const bootcamp = await this.bootcampRepo.findOne({
      where: {
        id: bootcampId,
      },
    });

    if (!bootcamp) {
      throw new NotFoundException(`Bootcamp #${bootcampId} not found`);
    }

    fs.unlink(`./uploads/${bootcamp.photo}`, (err) => {
      if (err) {
        throw err;
      }
    });

    await this.bootcampRepo.update(bootcampId, {
      photo: 'no_photo.jpg',
    });

    return {
      message: 'Photo deleted',
    };
  }

  async findOne(id: string): Promise<Bootcamp> {
    const bootcamp = await this.bootcampRepo.findOne({
      where: {
        id: id,
      },
      relations: ['courses'],
    });

    if (!bootcamp) {
      throw new NotFoundException(`Bootcamp #${id} not found`);
    }

    return bootcamp;
  }

  async create(
    createBootcampDto: CreateBootcampDto,
    user: ActiveUserData,
  ): Promise<Bootcamp> {
    const bootcampFound = await this.bootcampRepo
      .createQueryBuilder('bootcamp')
      .leftJoinAndSelect('bootcamp.user', 'user')
      .where('bootcamp.user = :userId', { userId: user.sub })
      .select()
      .getOne();

    // If the user is not an admin, they can only add one bootcamp:
    if (bootcampFound && user.role !== RoleType.ADMIN) {
      throw new UnauthorizedException();
    }

    const bootcamp = this.bootcampRepo.create({
      ...createBootcampDto,
    });

    return this.bootcampRepo.save(bootcamp);
  }

  async update(
    id: string,
    updateBootcampDto: UpdateBootcampDto,
    user: ActiveUserData,
  ): Promise<Bootcamp> {
    const bootcamp = await this.bootcampRepo.preload({
      id: id,
      ...updateBootcampDto,
    });

    if (!bootcamp) {
      throw new NotFoundException(`Bootcamp #${id} not found`);
    }

    const bootcampFound = await this.bootcampRepo.findOne({
      relations: {
        user: true,
      },
      where: {
        id: id,
      },
    });

    // Make sure user is bootcamp owner
    if (
      bootcampFound.user.id.toString() !== user.sub.toString() &&
      user.role !== RoleType.ADMIN
    ) {
      throw new UnauthorizedException();
    }

    return this.bootcampRepo.save(bootcamp);
  }

  async remove(id: string, user: ActiveUserData): Promise<Bootcamp> {
    const bootcamp = await this.bootcampRepo.findOneBy({
      id: id,
    });

    // This one is stupid and has two FIND calls to the DB. TODO: Refactor:
    const bootcampFound = await this.bootcampRepo.findOne({
      relations: {
        user: true,
      },
      where: {
        id: id,
      },
    });

    // Make sure user is bootcamp owner
    if (
      bootcampFound.user.id.toString() !== user.sub.toString() &&
      user.role !== RoleType.ADMIN
    ) {
      throw new UnauthorizedException();
    }

    return this.bootcampRepo.remove(bootcamp);
  }

  async seedUpBootcamp(user: ActiveUserData) {
    const bootcamps = JSON.parse(
      fs.readFileSync(
        `${path.join(__dirname, '../../_data')}/bootcamps.json`,
        'utf-8',
      ),
    );

    const bootcampEntities = this.bootcampRepo.create(bootcamps);

    await this.bootcampRepo
      .createQueryBuilder()
      .insert()
      .into(Bootcamp)
      .values(bootcampEntities)
      .execute();

    return {
      success: true,
      message: 'Bootcamps inserted~',
    };
  }

  async seedDownBootcamp(user: ActiveUserData) {
    await this.bootcampRepo.clear();

    return {
      success: true,
      message: 'Bootcamps deleted!',
    };
  }
}
