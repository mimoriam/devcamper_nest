import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePassDto {
  @ApiProperty()
  @IsString()
  readonly currentPassword: string;

  @ApiProperty()
  @IsString()
  readonly newPassword: string;
}
