// npm install class-validator class-transformer
// npm install @nestjs/typeorm typeorm pg
// npm install @nestjs/config
// npm install joi

// npm i cookie-parser
// npm i -D @types/cookie-parser

// nest g resource bootcamps
// npm install @nestjs/swagger swagger-ui-express

// npm i slugify

// npm i node-geocoder
// npm i -D @types/node-geocoder
// npm i -D @types/geojson

// npm install nestjs-paginate

// npm i -D @types/multer

// Authentication starts here:
// nest g resource users
// npm i bcrypt
// npm i -D @types/bcrypt

// nest g module iam
// nest g service iam/hashing
// nest g service iam/hashing/bcrypt --flat

// nest g service iam/authentication
// nest g controller iam/authentication
// nest g class iam/authentication/dto/sign-up.dto --no-spec
// nest g class iam/authentication/dto/sign-in.dto --no-spec

// npm i @nestjs/jwt

// nest g guard iam/authentication/guards/access-token
// nest g guard iam/authentication/guards/authentication

// This is for refresh token rotation:
// npm i --save ioredis
// nest g class iam/authentication/refresh-token-ids.storage

// Forgot/Reset Password:
// npm i nodemailer
// npm i -D @types/nodemailer

// Admin panel:
// npm i adminjs @adminjs/nestjs @adminjs/typeorm
// npm i @adminjs/express express-session express-formidable
// npm i @adminjs/import-export

// Authorization/CASL:
// npm i @casl/ability
// nest g module casl
// nest g class casl/casl-ability.factory

// npm i --save helmet
// npm i --save @nestjs/throttler

// WARNING: This package is deprecated so won't use:
// npm i --save csurf

// npm i google-auth-library
// nest g s iam/authentication/social/google-authentication --flat
// nest g co iam/authentication/social/google-authentication --flat

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: ['http://localhost:8000', 'http://localhost:3000'],
      credentials: true,
    },
  });

  app.use(helmet());

  app.enableVersioning({
    type: VersioningType.URI,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      enableDebugMessages: true,
      whitelist: true,
      transform: true,
      // forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.use(cookieParser());

  const options = new DocumentBuilder()
    .setTitle('DevCamper')
    .setDescription('DevCamper Application')
    .setVersion('1.0')
    .addTag('bootcamps')
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}

bootstrap().then();
