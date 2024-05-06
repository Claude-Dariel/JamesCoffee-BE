import {
  Body, Controller, Param, Post, HttpException,
  HttpStatus, Get,
  Res
} from '@nestjs/common';
import { ProductDTO } from './../Product/Product.dto';
import { OrderService } from './order.service';
import { OrderDto } from './order.dto';
import { Response } from 'express';
import { AxiosError, AxiosResponse } from 'axios';

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
  async getAcceptedOrders() {
    try {
      const acceptedOrders: OrderDto[] = this.orderService.getAcceptedOrders();
      console.log('Accepted orders being sent to URL: ', acceptedOrders)
      return acceptedOrders;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
