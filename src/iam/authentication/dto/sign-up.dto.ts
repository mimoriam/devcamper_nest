import { IsEmail, IsString, MinLength } from 'class-validator';
import { RoleType } from '../../../users/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

export class SignUpDto {
  @ApiProperty()
  @IsString()
  readonly name: string;

  @ApiProperty()
  @IsEmail()
  readonly email: string;

  @ApiProperty()
  @IsString()
  readonly role: RoleType;

  @ApiProperty()
  @MinLength(5)
  readonly password: string;
}
