import { IsBoolean, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBootcampDto {
  @ApiProperty()
  @IsString()
  readonly id: string;

  @ApiProperty()
  @IsString()
  readonly user: string;

  @ApiProperty()
  @IsString()
  readonly name: string;

  @ApiProperty()
  @IsString()
  readonly description: string;

  @ApiProperty()
  @IsString()
  readonly website: string;

  @ApiProperty()
  @IsString()
  readonly phone: string;

  @ApiProperty()
  @IsString()
  readonly email: string;

  @ApiProperty()
  @IsString()
  readonly address: string;

  @ApiProperty()
  @IsString({ each: true })
  readonly careers: string[];

  @ApiProperty()
  @IsBoolean()
  readonly housing: boolean;

  @ApiProperty()
  @IsBoolean()
  readonly jobAssistance: boolean;

  @ApiProperty()
  @IsBoolean()
  readonly jobGuarantee: boolean;

  @ApiProperty()
  @IsBoolean()
  readonly acceptGi: boolean;
}
