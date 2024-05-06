// webhook.service.ts
import { Injectable, Logger, Param } from '@nestjs/common';
import { AxiosError, AxiosResponse } from 'axios';
import axios from 'axios';
import { WebhookDTO } from './Webhook.dto';
import { catchError, firstValueFrom } from 'rxjs';
import { MessageService } from 'src/message/message.service';
import * as dotenv from 'dotenv';
import { send } from 'process';

@Injectable()
export class WebhookService {
  private token: string =
    process.env.TOKEN ||
    'EAAN9YXBWtYMBO27nscHjYDHF39NmfQNtpffKYqNZCfMqpb4Xd84GvAdKHFE0J68eORXNxa9ZBBOaIudJM1uHqkIrePLWGZB0yfWdQSFKLNXVgNj4yGHzoIKbgyZCLoVRt8Dbf2hTDZBJsG54KPspGtO5aoM5qnFIqs3dsCDb8j5RCDB1rH5ICeSDupNaSGYibBeN2W5mU74ZBZCNkAceJAZD';
  private mytoken: string = process.env.MYTOKEN || ''; // Providing empty string as default value
  private logger = new Logger();
  httpService: any;
  url: any;
  catalogId: any;

  constructor(private messageService: MessageService) {
    dotenv.config();
  }

  verifyWebhook(mode: string, verifyToken: string, challenge: string) {
    if (mode === 'subscribe' && verifyToken === this.mytoken) {
      return challenge;
    } else {
      throw new Error(
        `Invalid subscription verification mode: ${mode}, Verify Token: ${verifyToken} - My token: ${this.mytoken}`,
      );
    }
  }

  async handleWebhook(data: WebhookDTO): Promise<void> {
    console.log(JSON.stringify(data, null, 2));
    
    const thisType = data.entry[0].changes[0].value.messages[0].type;

    console.log(thisType);
    const phoneNumber = data.entry[0].changes[0].value.contacts[0].wa_id;
    console.log('Number associated with order: ', phoneNumber);

    if(thisType === 'order'){
      this.messageService.findAllFromWhatsAppBusiness(phoneNumber, 'hello_world');
    }
    if(thisType === 'text'){
      this.messageService.findAllFromWhatsAppBusiness(phoneNumber, 'welcome');
    }
  }
}
