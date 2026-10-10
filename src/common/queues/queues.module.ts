import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { requiredEnv } from '../config/required-env';
import { QueueNames } from './enums/queue-names.enum';

@Module({
  imports: [BullModule.forRoot({ connection: { url: requiredEnv('REDIS_URL') } }), BullModule.registerQueue({ name: QueueNames.TournamentFinalization })],
  exports: [BullModule],
})
export class QueuesModule {}
