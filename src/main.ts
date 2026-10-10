import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';

async function bootstrapAsync(): Promise<void> {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());
  app.enableShutdownHooks();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  try {
    await app.listen({ host: '0.0.0.0', port: Number(process.env.PORT ?? 3000) });
  } catch (error: unknown) {
    await app.close();
    throw error;
  }
}

void bootstrapAsync().catch((error: unknown): void => {
  console.error(error);
  process.exitCode = 1;
});
