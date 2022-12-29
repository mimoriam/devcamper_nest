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

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

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
