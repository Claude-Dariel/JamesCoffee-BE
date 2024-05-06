import {
  Body, Controller, Param, Post, HttpException,
  HttpStatus, Get,
  Res
} from '@nestjs/common';
import { ProductDTO } from './../Product/Product.dto';
import { OrderService } from './order.service';
import { OrderDto } from './order.dto';
import { Response } from 'express';

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

  @Get()
  getAcceptedOrders(@Res() res: Response) {
    const acceptedOrders = this.orderService.getAcceptedOrders();
    console.log('Accepted orders on the server: ', acceptedOrders)
    // Sending the acceptedOrders array as a response
    res.json(acceptedOrders);
  }

}
