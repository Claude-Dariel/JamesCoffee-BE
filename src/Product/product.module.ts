import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

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
  ],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
