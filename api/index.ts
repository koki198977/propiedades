import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './apps/api/src/app.module'; // Ruta corregida desde la raíz
import * as express from 'express';

const server = express();
const adapter = new ExpressAdapter(server);

let app: any;

async function bootstrap() {
  if (!app) {
    app = await NestFactory.create(AppModule, adapter);
    
    app.enableCors({
      origin: true,
      credentials: true,
    });

    app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: '1',
    });

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );

    await app.init();
  }
}

export default async function (req: any, res: any) {
  await bootstrap();
  server(req, res);
}
