import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { WebhookDTO } from './Webhook.dto';
import { WebhookService } from './webhook.service';
import { Response } from 'express';

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
  async verifyToken(
    @Query('hub.mode') mode: string,
    @Query('hub.verifyToken') verifyToken: string,
    @Query('hub.challenge') challenge: string,
  ) {
    console.log(mode);
    console.log(verifyToken);
    console.log(challenge);

    return await this.webhookService.verifyWebhook(
      mode,
      verifyToken,
      challenge,
    );
  }

  @Get('save')
  async verify(verifyToken: string, @Res() res: Response) {
    if (verifyToken) {
      if (verifyToken === process.env.MYTOKEN) {
        return res.status(HttpStatus.OK).send('OK');
      } else {
        return res.status(HttpStatus.FORBIDDEN).send();
      }
    }
  }
}
