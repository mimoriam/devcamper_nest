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
}
