import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { WorkerModule } from './worker.module';

async function bootstrapWorkerAsync(): Promise<void> {
  const application = await NestFactory.createApplicationContext(WorkerModule);
  application.enableShutdownHooks();
}

void bootstrapWorkerAsync().catch((error: unknown): void => {
  console.error(error);
  process.exitCode = 1;
});
