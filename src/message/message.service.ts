import { HttpService } from '@nestjs/axios';
import { Get, Injectable } from '@nestjs/common';
import { AxiosRequestConfig } from 'axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class MessageService {
  private request: AxiosRequestConfig = {
    headers: {
      'Content-Type': 'application/json',
      Authorization:
        'Bearer EAAN9YXBWtYMBOZC6N9DSsbCKRAYEuZBrpQ6wVRHpvqKVaLsUH3b4Lh5ow18jQHrEaZCEzwEoZBaH0b2rIC976vlXDC53hxAyi9AoqhKjP0gGQu0DEj77zGrt7QoclMdK4k2qDgOmswHF00jX19S6JBRa5dHYmByKF3lZCsyfbZCfkPAkpmBS74cqrgpzbZCQcefVguoJ6jdBWXqkQf8',
    },
  };
  productService: any;
  constructor(private readonly httpService: HttpService) { }

  sendMessage() {
    this.httpService.post('');
  }

  async findAllFromWhatsAppBusiness(phone_number: string, templateName: string, variables: string[]) {
    console.log(`Sending message to ${phone_number}`);

    let response;
    const hasVariables = variables.length !== 0;    
    const params = [];

    for (const variable of variables) {
        const parameterObject = {
            type: 'text',
            text: variable
        }

        params.push(parameterObject);
    }

    console.log(JSON.stringify(params, null, 2));

    if(hasVariables){
      const component = [];
      const componentObj = {
          type: 'body',
          parameters: params
      };
      component.push(componentObj);
      response = firstValueFrom(this.httpService.post(
        'https://graph.facebook.com/v19.0/229189383622046/messages',
        {
          messaging_product: 'whatsapp',
          to: phone_number,
          type: 'template',
          template: {
            name: templateName,
            language: {
              code: 'en_US',
            },
            "components": component
          },
        },
        this.request,
      )
      );
    }
    else{
      response = firstValueFrom(this.httpService.post(
        'https://graph.facebook.com/v19.0/229189383622046/messages',
        {
          messaging_product: 'whatsapp',
          to: phone_number,
          type: 'template',
          template: {
            name: templateName,
            language: {
              code: 'en_US',
            }
          },
        },
        this.request,
      )
      );
    }

    return (await response).data;
    //console.log('Response:', response.status);
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
