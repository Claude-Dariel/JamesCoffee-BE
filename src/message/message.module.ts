import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule.registerAsync({
      useFactory: () => ({
        timeout: 9000,
        maxRedirects: 1,
      }),
    }),
  ],
  providers: [MessageService],
})
export class MessageModule {}
