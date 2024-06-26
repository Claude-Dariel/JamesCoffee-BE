// webhook.service.ts
import { Injectable, Logger, Param } from '@nestjs/common';
import { AxiosError, AxiosResponse } from 'axios';
import axios from 'axios';
import { WebhookDTO } from './Webhook.dto';
import { catchError, firstValueFrom } from 'rxjs';
import { MessageService } from 'src/message/message.service';
import * as dotenv from 'dotenv';
import { send } from 'process';
import { OrderDto } from 'src/Order/order.dto';
import { OrderService } from 'src/Order/order.service';
import { v4 as uuidv4 } from 'uuid';
import { ProductDTO } from 'src/Product/Product.dto';

@Injectable()
export class WebhookService {
  private token: string =
    process.env.TOKEN ||
    'EAAN9YXBWtYMBO27nscHjYDHF39NmfQNtpffKYqNZCfMqpb4Xd84GvAdKHFE0J68eORXNxa9ZBBOaIudJM1uHqkIrePLWGZB0yfWdQSFKLNXVgNj4yGHzoIKbgyZCLoVRt8Dbf2hTDZBJsG54KPspGtO5aoM5qnFIqs3dsCDb8j5RCDB1rH5ICeSDupNaSGYibBeN2W5mU74ZBZCNkAceJAZD';
  private mytoken: string = process.env.MYTOKEN || ''; // Providing empty string as default value
  private logger = new Logger();
  private ORDER = 'order';
  private BUTTON = 'button';
  private TEXT = 'text';

  httpService: any;
  url: any;
  catalogId: any;

  constructor(private messageService: MessageService, private orderService: OrderService) {
    dotenv.config();
  }

  private generateGUID(): string {
    return uuidv4();
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

  private handleOrderMessage(data: WebhookDTO) {
    console.log('Order incoming: ', JSON.stringify(data, null, 2));

    let items = data.entry[0].changes[0].value.messages[0].order.product_items;
    let products: ProductDTO[] = [];

    for(var item of items){
      products.push({
        id: '',
        name: '',
        description: '',
        price: Number(item.item_price),
        retailer_id: Number(item.product_retailer_id)
      });
    }

    const order: OrderDto = {
      id: this.generateGUID(),
      price: '',
      phoneNumber: data.entry[0].changes[0].value.contacts[0].wa_id,
      templateName: 'order_confirmation',
      products: products
    };

    this.orderService.receiveOrder(order);
  }

  private handleTextMessage(data: WebhookDTO) {
    const name = data.entry[0].changes[0].value.contacts[0].profile.name;
    const variables = [name];
    const phone_number = data.entry[0].changes[0].value.contacts[0].wa_id;
    this.messageService.findAllFromWhatsAppBusiness(phone_number, 'welcome', variables);
  }

  private handleButtonPress(data: WebhookDTO) {
    const phoneNumber = data.entry[0].changes[0].value.contacts[0].wa_id;
    const customerResponse = data.entry[0].changes[0].value.messages[0].button.text;

    const order: OrderDto = {
      id: '',
      price: '',
      phoneNumber: phoneNumber,
      templateName: ''
    };

    if (customerResponse.toLowerCase() === 'confirm') {
      this.orderService.acceptOrder(order);
      this.messageService.findAllFromWhatsAppBusiness(phoneNumber, 'order_accepted', []);
    }
    else if (customerResponse.toLowerCase() === 'cancel') {
      this.orderService.cancelOrder(order);
      this.messageService.findAllFromWhatsAppBusiness(phoneNumber, 'order_cancelled', []);
    }
  }

  async handleWebhook(data: WebhookDTO): Promise<void> {
    const thisType = data.entry[0].changes[0].value.messages[0].type;

    if (thisType === this.ORDER) {
      this.handleOrderMessage(data);
    }
    if (thisType === this.TEXT) {
      this.handleTextMessage(data);
    }
    if (thisType === this.BUTTON) {
      this.handleButtonPress(data);
    }
  }
}
