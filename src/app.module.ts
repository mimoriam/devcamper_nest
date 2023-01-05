import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BootcampsModule } from './bootcamps/bootcamps.module';
import { CoursesModule } from './courses/courses.module';
import { UsersModule } from './users/users.module';
import { IamModule } from './iam/iam.module';

import { AdminModule } from '@adminjs/nestjs';
import * as AdminJSTypeorm from '@adminjs/typeorm';
import AdminJS from 'adminjs';
import importExportFeature from '@adminjs/import-export';

import { Bootcamp } from './bootcamps/entities/bootcamp.entity';
import { Course } from './courses/entities/course.entity';
import { User } from './users/entities/user.entity';
import { CaslModule } from './casl/casl.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

AdminJS.registerAdapter({
  Resource: AdminJSTypeorm.Resource,
  Database: AdminJSTypeorm.Database,
});

const DEFAULT_ADMIN = {
  email: 'test@gmail.com',
  password: 'test12345',
};

const authenticate = async (email: string, password: string) => {
  if (email === DEFAULT_ADMIN.email && password === DEFAULT_ADMIN.password) {
    return Promise.resolve(DEFAULT_ADMIN);
  }
  return null;
};

@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 10 * 60 * 1000, // 10 mins
      limit: 100,
    }),
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

    AdminModule.createAdminAsync({
      useFactory: () => ({
        adminJsOptions: {
          rootPath: '/admin',
          resources: [
            {
              resource: Bootcamp,
              options: {},
              features: [importExportFeature()],
            },
            {
              resource: Course,
              options: {},
              features: [importExportFeature()],
            },
            // Logger entity to log all admin actions:
            {
              resource: User,
              options: {
                properties: { password: { isVisible: true } },
              },
              features: [importExportFeature()],
            },
          ],
        },
        // auth: {
        //   authenticate,
        //   cookieName: 'adminjs',
        //   cookiePassword: 'secret',
        // },
        // sessionOptions: {
        //   resave: true,
        //   saveUninitialized: true,
        //   secret: 'secret',
        // },
      }),
    }),

    CaslModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
