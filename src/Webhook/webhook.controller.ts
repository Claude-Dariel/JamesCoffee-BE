import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
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
  async verify(
    @Query('mode') mode: string,
    @Query('verifyToken') verifyToken: string,
    @Query('challenge') challenge: string,
  ) {
    return await this.webhookService.verifyWebhook(mode, verifyToken, challenge);
  }
}
