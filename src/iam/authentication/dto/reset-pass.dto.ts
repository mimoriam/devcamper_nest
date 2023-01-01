import { IsString } from 'class-validator';

export class ResetPassDto {
  @IsString()
  password: string;
}
