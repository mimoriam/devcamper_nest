import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { USERS_CACHE_KEY } from './users.controller';
import { Cache } from 'cache-manager';

// retrieve the values using: cacheManager.get('key') method,
// add items using: cacheManager.set('key', 'value),
// remove elements using: cacheManager.del('key'),
// clear the cache using: cacheManager.reset().

@Injectable()
export class UsersService {
  constructor(
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  async clearCache() {
    const keys: string[] = await this.cacheManager.store.keys();
    keys.forEach((key) => {
      if (key.startsWith(USERS_CACHE_KEY)) {
        this.cacheManager.del('key');
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
