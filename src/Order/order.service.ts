import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';
import { ProductDTO } from 'src/Product/Product.dto';
import { OrderDto } from './order.dto';
import { MessageService } from 'src/message/message.service';

@Injectable()
export class OrderService {
  constructor(private readonly httpService: HttpService, private messageService: MessageService) {}

  async order(requestData: ProductDTO) {
    return await firstValueFrom(
      this.httpService
        .post(
          'https://graph.facebook.com/v18.0/229189383622046/messages',
          requestData,
        )
        .pipe(
          catchError((err: AxiosError) => {
            console.log(err.message);
            throw new Error(err.message);
          }),
        ),
    );
  }

  async handleOrder(data: OrderDto): Promise<void>{
    this.messageService.findAllFromWhatsAppBusiness(data.phoneNumber, data.templateName, [data.id, data.price]);
  }
}
