import {
    Body,
    Controller,
    HttpException,
    HttpStatus,
    Post,
  } from '@nestjs/common';
import { MessageService } from './message.service';
import { AxiosResponse } from 'axios';
  
  @Controller('message')
  export class MessageController {
    constructor(private messageService: MessageService) {}
  
    @Post()
    async get(@Body() requestData: MessageDTO) {
      return await this.messageService
        .findAllFromWhatsAppBusiness(requestData.phone_number, requestData.templateName, requestData.variables)
        .then((axiosResponse: AxiosResponse) => axiosResponse.data)
        .catch((error) => {
          throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        });
    }
  }
  