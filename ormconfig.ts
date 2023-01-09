import { DataSource } from 'typeorm';

import * as dotenv from 'dotenv';
import * as path from 'path';
import { Bootcamp } from "./src/bootcamps/entities/bootcamp.entity";
import { Course } from "./src/courses/entities/course.entity";
import { User } from "./src/users/entities/user.entity";

// console.log(path.join(__dirname, '/.env'));

dotenv.config({ path: path.join(__dirname, '/.env') });

const connectionSource = new DataSource({
  migrationsTableName: 'migrations_table',
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  // entities: ['dist/**/*.entity.ts'],
  entities: [Bootcamp, Course, User],
  subscribers: [],
  migrations: ['src/migrations/*.ts'],
  logging: false,
  synchronize: false,
});

export default connectionSource;
