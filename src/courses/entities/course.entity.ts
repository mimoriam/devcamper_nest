import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { IsBoolean, IsEnum, IsNumber, IsString } from 'class-validator';
import { Bootcamp } from '../../bootcamps/entities/bootcamp.entity';
import { User } from '../../users/entities/user.entity';

export enum minimumSkillType {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

@Entity({ name: 'courses' })
@Index(['title'], { unique: true, fulltext: true })
export class Course {
  @PrimaryColumn()
  id: string;

  @Column({ unique: true })
  @IsString()
  title: string;

  @Column()
  @IsString()
  description: string;

  @Column()
  @IsNumber()
  weeks: number;

  @Column()
  @IsNumber()
  tuition: number;

  @Column({
    type: 'enum',
    enum: minimumSkillType,
    default: minimumSkillType.BEGINNER,
    name: 'minimum_skill',
  })
  minimumSkill: minimumSkillType;

  @Column({ name: 'scholarship_available', default: false })
  @IsBoolean()
  scholarshipsAvailable: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Bootcamp, (bootcamp) => bootcamp.courses, {
    nullable: true,
    onDelete: 'CASCADE',
    eager: true,
  })
  bootcamp: Bootcamp;

  @ManyToOne(() => User, (user) => user.courses, {
    // nullable: true,
    onDelete: 'CASCADE',
    eager: true,
  })
  user: User;
}

import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
} from 'typeorm';

// https://docs.nestjs.com/techniques/database#subscribers

@EventSubscriber()
export class CourseSubscriber implements EntitySubscriberInterface<Course> {
  constructor(readonly dataSource: DataSource) {
    dataSource.subscribers.push(this);
  }

  listenTo() {
    return Course;
  }

  async afterInsert(event: InsertEvent<Course>) {
    const bootcampRepo = this.dataSource.getRepository(Bootcamp);

    const bootcamps = await bootcampRepo.findOne({
      where: { id: event.entity.bootcamp.toString() },
      relations: {
        courses: true,
      },
    });

    const count = await bootcampRepo
      .createQueryBuilder('b')
      .leftJoinAndSelect('b.courses', 'course')
      .where({ id: event.entity.bootcamp.toString() })
      .loadRelationCountAndMap('b.courseCount', 'b.courses')
      .getMany();

    if (bootcamps.averageCost === null) {
      await bootcampRepo.update(event.entity.bootcamp.toString(), {
        averageCost: Math.ceil(event.entity.tuition),
      });
    } else {
      await bootcampRepo.update(event.entity.bootcamp.toString(), {
        averageCost: Math.ceil(
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          (bootcamps.averageCost + event.entity.tuition) / count[0].courseCount,
        ),
      });
    }
  }
}
