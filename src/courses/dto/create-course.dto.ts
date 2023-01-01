import { IsBoolean, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Bootcamp } from '../../bootcamps/entities/bootcamp.entity';
import { minimumSkillType } from '../entities/course.entity';
import { User } from '../../users/entities/user.entity';

export class CreateCourseDto {
  @ApiProperty()
  @IsString()
  readonly id: string;

  @ApiProperty()
  @IsString()
  readonly title: string;

  @ApiProperty()
  @IsString()
  readonly description: string;

  @ApiProperty()
  @IsNumber()
  readonly weeks: number;

  @ApiProperty()
  @IsNumber()
  readonly tuition: number;

  @ApiProperty()
  @IsString()
  readonly minimumSkill: minimumSkillType;

  @ApiProperty()
  @IsBoolean()
  readonly scholarshipsAvailable: boolean;

  @ApiProperty()
  @IsString()
  readonly bootcamp: Bootcamp;

  @ApiProperty()
  @IsString()
  readonly user: User;
}
