import {
  Body, Controller, Param, Post, HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ProductDTO } from './../Product/Product.dto';
import { OrderService } from './order.service';
import { OrderDto } from './order.dto';

@Controller('orders')
export class OrderController {
  constructor(private orderService: OrderService) { }

  @Post()
  async orderProduct(@Body() product: ProductDTO) {
    return this.orderService.order(product).then((res) => {
      return res.data.data;
    });
  }

  @Post()
  async get(@Body() requestData: OrderDto) {
    return await this.orderService
      .receiveOrder(requestData)
      //.then((axiosResponse: AxiosResponse) => axiosResponse.data)
      .catch((error) => {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      });
  }
}
