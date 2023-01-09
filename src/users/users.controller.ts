import {
  Body,
  CacheInterceptor,
  CacheKey,
  CacheTTL,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiTags } from '@nestjs/swagger';
import { Auth } from '../iam/authentication/decorators/auth.decorator';
import { AuthType } from '../iam/authentication/enums/auth-type.enum';
import { AbilitiesGuard } from '../casl/guards/abilities.guard';
import { CheckAbilities } from '../casl/decorators/abilities.decorator';
import { Action } from '../casl/casl-ability.factory';
import { User } from './entities/user.entity';

export const USERS_CACHE_KEY = 'GET_USERS_CACHE';

@UseInterceptors(ClassSerializerInterceptor)
// @Roles(RoleType.ADMIN)
@ApiTags('users')
@Controller('api/v1/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Auth(AuthType.Bearer)
  @UseGuards(AbilitiesGuard)
  @CheckAbilities({ action: Action.Read, subject: User })
  @UseInterceptors(CacheInterceptor) // Automatically cache the response for this endpoint
  @CacheKey(USERS_CACHE_KEY)
  @CacheTTL(30)
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
