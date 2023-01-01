import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { IsEmail, IsString, Length } from 'class-validator';
import { Exclude } from 'class-transformer';

export enum RoleType {
  USER = 'user',
  PUBLISHER = 'publisher',
}

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ unique: true })
  @IsString()
  name: string;

  @Column({ unique: true })
  @IsEmail({ message: 'Please add a valid email' })
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

  @Column({ name: 'reset_password_token', unique: true, nullable: true })
  resetPasswordToken: string;

  @Column({
    type: 'timestamp',
    name: 'reset_password_expire',
    nullable: true,
  })
  resetPasswordExpire: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  /***
   * END
   * ***/
}
