import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { HttpModule } from '@nestjs/axios';
import { MessageController } from './message.controller';

@Module({
  imports: [
    HttpModule.registerAsync({
      useFactory: () => ({
        timeout: 9000,
        maxRedirects: 1,
      }),
    }),
  ],
  controllers: [MessageController],
  providers: [MessageService],
})
export class MessageModule {}
