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

  @Post(':id/complete')
  async completeOrder(@Param('id') id: string) {
    await this.orderService.notifyCustomerOfCompletion(id);
    return { message: `Order ${id} completed successfully` };
  }

  @Post(':id/prepare')
  async prepareOrder(@Param('id') id: string) {
    await this.orderService.notifyCustomerOfPreparation(id);
    return { message: `Order ${id} prepared successfully` };
  }

  @Get()
  async getAcceptedOrders() {
    try {
      // Retrieve accepted orders from OrderService
      const acceptedOrders: OrderDto[] = await this.orderService.getAcceptedOrdersAsync();
      console.log('Accepted orders being called by URL in OrderController: ', acceptedOrders);      
      // Return the array of accepted orders
      return acceptedOrders;
    } catch (error) {
      // Handle errors
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
