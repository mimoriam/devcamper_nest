import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPassDto {
  @ApiProperty()
  @IsEmail()
  readonly email: string;
}
