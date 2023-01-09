import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

import { Cache } from 'cache-manager';
import { GET_USERS_CACHE_KEY } from './usersCacheKey.constant';

@Injectable()
export class UsersService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async clearCache() {
    const keys: string[] = await this.cacheManager.store.keys();
    keys.forEach((key) => {
      if (key.startsWith(GET_USERS_CACHE_KEY)) {
        this.cacheManager.del(key);


      }
    });
  }

  async create(createUserDto: CreateUserDto) {
    await this.clearCache();
    return 'This action adds a new user';
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    await this.clearCache();
    return `This action updates a #${id} user`;
  }

  async remove(id: number) {
    await this.clearCache();
    return `This action removes a #${id} user`;
  }
}
