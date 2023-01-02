import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BootcampsModule } from './bootcamps/bootcamps.module';
import { CoursesModule } from './courses/courses.module';
import { UsersModule } from './users/users.module';
import { IamModule } from './iam/iam.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
    }),

    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT),
        username: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        autoLoadEntities: true,
        subscribers: [],
        migrations: [],
        logging: false,
        synchronize: true,
        cache: {
          duration: 3000, // 3 seconds
        },
        // This is to make sure TypeORM uses Postgres server's timezone:
        timezone: 'Z',
      }),
    }),

    BootcampsModule,
    CoursesModule,
    UsersModule,
    IamModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
