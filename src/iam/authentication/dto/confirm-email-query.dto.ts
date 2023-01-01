import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ConfirmEmailQueryDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  readonly token: string;
}
