import { IsEmail, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignInDto {
  @ApiProperty()
  @IsEmail()
  readonly email: string;

  @ApiProperty()
  @MinLength(5)
  readonly password: string;
}
