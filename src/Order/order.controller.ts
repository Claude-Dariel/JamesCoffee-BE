import { Body, Controller, Param, Post } from '@nestjs/common';
import { ProductDTO } from './../Product/Product.dto';
import { OrderService } from './order.service';

@Controller('orders')
export class OrderController {
  constructor(private orderService: OrderService) {}

  @Post()
  async orderProduct(@Body() product: ProductDTO) {
    return this.orderService.order(product).then((res) => {
      return res.data.data;
    });
  }
}
