// npm install class-validator class-transformer
// npm install @nestjs/typeorm typeorm pg
// npm install @nestjs/config
// npm install joi

// npm i cookie-parser
// npm i -D @types/cookie-parser

// nest g resource bootcamps
// npm install @nestjs/swagger swagger-ui-express

// npm i slugify

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableVersioning({
    type: VersioningType.URI,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      enableDebugMessages: true,
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.use(cookieParser());

  await app.listen(3000);
}

bootstrap().then();
