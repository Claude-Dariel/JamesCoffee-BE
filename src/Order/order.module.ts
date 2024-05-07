import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { HttpModule } from '@nestjs/axios';
import { MessageService } from 'src/message/message.service';
import { ProductService } from 'src/Product/product.service';

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
  providers: [OrderService, MessageService, ProductService],
})
export class OrderModule {}
