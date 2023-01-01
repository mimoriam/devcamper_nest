import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { IsBoolean, IsEmail, IsString, Length } from 'class-validator';
import { Exclude } from 'class-transformer';
import { Bootcamp } from '../../bootcamps/entities/bootcamp.entity';
import { Course } from '../../courses/entities/course.entity';

export enum RoleType {
  USER = 'user',
  PUBLISHER = 'publisher',
  ADMIN = 'admin',
}

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ unique: true })
  @IsString()
  name: string;

  @Column({ unique: true })
  @IsEmail()
  @IsString()
  email: string;

  @Column({
    type: 'enum',
    enum: RoleType,
    default: RoleType.USER,
  })
  role: RoleType;

  /***
   * Auto-generated entries start here:
   * ***/

  // Instead of select: false, use class-transformer's @Exclude()
  // https://docs.nestjs.com/techniques/serialization
  // @Column({ select: false })
  @Exclude()
  @Column()
  @Length(5)
  password: string;

  @Exclude()
  @Column({ name: 'reset_password_token', unique: true, nullable: true })
  resetPasswordToken: string;

  @Exclude()
  @Column({
    type: 'timestamp',
    name: 'reset_password_expire',
    nullable: true,
  })
  resetPasswordExpire: Date;

  @Exclude()
  @Column({ name: 'confirm_email_token', unique: true, nullable: true })
  confirmEmailToken: string;

  @Exclude()
  @Column({ name: 'is_email_confirmed', default: false })
  @IsBoolean()
  isEmailConfirmed: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => Bootcamp, (bootcamp) => bootcamp.user, {
    cascade: true,
    eager: true,
  })
  bootcamps: Bootcamp[];

  @OneToMany(() => Course, (course) => course.user, {
    cascade: true,
    eager: true,
  })
  courses: Course[];

  /***
   * END
   * ***/

  @BeforeInsert()
  async forbidUserRoleChangeToAdmin() {
    if (this.role === RoleType.ADMIN) {
      this.role = RoleType.USER;
    }
  }
}
