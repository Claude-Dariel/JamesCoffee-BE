import { Module } from '@nestjs/common';
import { WebhookController } from './webhook.controller';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager'; // Import CacheModule
import { WebhookService } from './webhook.service';
import { MessageService } from 'src/message/message.service';
import { OrderDto } from '../Order/order.dto';
import { OrderService } from 'src/Order/order.service';
import { ProductModule } from 'src/Product/product.module';
import { ProductService } from 'src/Product/product.service';

@Module({
  imports: [
    ConfigModule,
    HttpModule.registerAsync({
      useFactory: () => ({
        timeout: 9000,
        maxRedirects: 1,
        headers: {
          'Content-Type': 'application/json',
          Authorization:
            'Bearer EAAN9YXBWtYMBOZC6N9DSsbCKRAYEuZBrpQ6wVRHpvqKVaLsUH3b4Lh5ow18jQHrEaZCEzwEoZBaH0b2rIC976vlXDC53hxAyi9AoqhKjP0gGQu0DEj77zGrt7QoclMdK4k2qDgOmswHF00jX19S6JBRa5dHYmByKF3lZCsyfbZCfkPAkpmBS74cqrgpzbZCQcefVguoJ6jdBWXqkQf8',
        },
      }),
    }),
    CacheModule.register(), // Include CacheModule here
  ],
  controllers: [WebhookController],
  providers: [WebhookService, MessageService, OrderService, ProductService]
})
export class WebhookModule {}
