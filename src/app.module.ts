import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductModule } from './Product/product.module';
import { OrderModule } from './Order/order.module';
import { ConfigModule } from '@nestjs/config';
import { WebhookModule } from './Webhook/webhook.module';

@Module({
  imports: [ConfigModule.forRoot(), ProductModule, OrderModule, WebhookModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
