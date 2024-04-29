import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { AxiosError, AxiosResponse } from 'axios';
import { WebhookDTO } from './Webhook.dto';
import { WebhookService } from './webhook.service';

interface FaceBookResponse {
  data: WebhookDTO[];
}

@Controller('webhook')
export class WebhookController {
  constructor(private webhookService: WebhookService) {}


  @Post()
  async get(@Body() requestData: WebhookDTO) {
    return await this.webhookService
      .handleWebhook(requestData)
      //.then((axiosResponse: AxiosResponse) => axiosResponse.data)
      .catch((error) => {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      });
  }

  

  @Get()
  async verify(mode: string, verifyToken: string, challenge: string){
    return await this.webhookService
      .verifyWebhook(mode, verifyToken, challenge)
      //.then((axiosResponse: AxiosResponse) => axiosResponse.data)
      //.catch((error: { message: string | Record<string, any>; }) => {
        //throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
  };
}
