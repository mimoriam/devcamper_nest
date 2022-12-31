import { IsEmail, IsString, MinLength } from 'class-validator';
import { RoleType } from '../../../users/entities/user.entity';

export class SignUpDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  role: RoleType;

  @MinLength(5)
  password: string;
}
