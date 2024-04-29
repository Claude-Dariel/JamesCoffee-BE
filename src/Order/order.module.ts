import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
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
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
