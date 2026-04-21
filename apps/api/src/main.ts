import { NestFactory } from '@nestjs/core'
import { ValidationPipe, VersioningType } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // ── CORS ─────────────────────────────────────────────────
  app.enableCors({
    origin: [
      'http://localhost:5173',  // Vite web dev
      'http://localhost:3001',  // Expo web dev (futuro)
      process.env.FRONTEND_URL ?? '',
    ].filter(Boolean),
    credentials: true,
  })

  // ── Versionado de API (/v1/) ───────────────────────────────
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  })

  // ── Validación global de DTOs ─────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  )

  // ── Swagger / OpenAPI ─────────────────────────────────────
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Propiedades API')
      .setDescription('Sistema de Gestión de Propiedades y Cobranza')
      .setVersion('1.0')
      .addBearerAuth()
      .build()
    const document = SwaggerModule.createDocument(app, config)
    SwaggerModule.setup('docs', app, document)
    console.log(`📚 Swagger: http://localhost:${process.env.API_PORT ?? 3000}/docs`)
  }

  const port = process.env.API_PORT ?? 3000
  await app.listen(port)
  console.log(`🚀 API corriendo en: http://localhost:${port}/v1`)
}

bootstrap()
