import { HttpService } from '@nestjs/axios';
import { Get, Injectable } from '@nestjs/common';
import { AxiosRequestConfig } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';

@Injectable()
export class MessageService {
  private recipient = '27814956903';
  private request: AxiosRequestConfig = {
    headers: {
      'Content-Type': 'application/json',
      Authorization:
        'Bearer EAAN9YXBWtYMBOZC6N9DSsbCKRAYEuZBrpQ6wVRHpvqKVaLsUH3b4Lh5ow18jQHrEaZCEzwEoZBaH0b2rIC976vlXDC53hxAyi9AoqhKjP0gGQu0DEj77zGrt7QoclMdK4k2qDgOmswHF00jX19S6JBRa5dHYmByKF3lZCsyfbZCfkPAkpmBS74cqrgpzbZCQcefVguoJ6jdBWXqkQf8',
    },
  };
  productService: any;
  constructor(private readonly httpService: HttpService) {}

  sendMessage() {
    this.httpService.post('');
  }

  async findAllFromWhatsAppBusiness() {
    console.log(`Sending message to ${this.recipient}`);

    const response = await firstValueFrom(
      this.httpService.post(
        'https://graph.facebook.com/v19.0/229189383622046/messages',
        {
          messaging_product: 'whatsapp',
          to: this.recipient,
          type: 'template',
          template: {
            name: 'hello_world',
            language: {
              code: 'en_US',
            },
          },
        },
        this.request,
      )
    );

    console.log('Response:', JSON.stringify(response, null, 2));
  }

  @Get('sendMessage')
  findFromWhatsApp() {
    let response = {};
    this.productService
      .findAllFromWhatsAppBusiness()
      .then((res: {}) => {
        response = res;
      })
      .catch((error: any) => console.log(error));
    return response;
  }
}
