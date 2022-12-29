import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBootcampDto } from './dto/create-bootcamp.dto';
import { UpdateBootcampDto } from './dto/update-bootcamp.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Bootcamp } from './entities/bootcamp.entity';
import { Repository } from 'typeorm';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class BootcampsService {
  constructor(
    @InjectRepository(Bootcamp)
    private readonly bootcampRepo: Repository<Bootcamp>,
  ) {}

  async findAll(): Promise<Bootcamp[]> {
    return this.bootcampRepo.find();
  }

  async findOne(id: string): Promise<Bootcamp> {
    const bootcamp = await this.bootcampRepo.findOneBy({
      id: id,
    });

    if (!bootcamp) {
      throw new NotFoundException(`Bootcamp #${id} not found`);
    }

    return bootcamp;
  }

  async create(createBootcampDto: CreateBootcampDto): Promise<Bootcamp> {
    const bootcamp = this.bootcampRepo.create({
      ...createBootcampDto,
    });

    return this.bootcampRepo.save(bootcamp);
  }

  async update(
    id: string,
    updateBootcampDto: UpdateBootcampDto,
  ): Promise<Bootcamp> {
    const bootcamp = await this.bootcampRepo.preload({
      id: id,
      ...updateBootcampDto,
    });

    if (!bootcamp) {
      throw new NotFoundException(`Bootcamp #${id} not found`);
    }

    return this.bootcampRepo.save(bootcamp);
  }

  async remove(id: string): Promise<Bootcamp> {
    const bootcamp = await this.bootcampRepo.findOneBy({
      id: id,
    });

    return this.bootcampRepo.remove(bootcamp);
  }

  async seedUpBootcamp() {
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

  async seedDownBootcamp() {
    await this.bootcampRepo.clear();

    return {
      success: true,
      message: 'Bootcamps deleted!',
    };
  }
}
