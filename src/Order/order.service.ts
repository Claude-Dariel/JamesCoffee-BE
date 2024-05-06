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
  private acceptedOrders: OrderDto[] = [];
  private tentativeOrders: OrderDto[] = [];

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

  async receiveOrder(data: OrderDto): Promise<void>{
    this.messageService.findAllFromWhatsAppBusiness(data.phoneNumber, data.templateName, [data.id, data.price]);
    this.tentativeOrders.push(data);
    console.log('After receiving orders: ')
    console.log('Accepted orders: ', console.log(this.acceptedOrders));
    console.log('Tentative orders: ', console.log(this.tentativeOrders));    
  }

  async acceptOrder(data: OrderDto){
      const order = this.tentativeOrders.find(item => item.phoneNumber === data.phoneNumber);
      if (order) {
          this.acceptedOrders.push(order);
          this.tentativeOrders = this.tentativeOrders.filter(item => item !== data);
      } else {
          console.log('Order not found in tentative orders');
      }
      console.log('After accepting orders: ')
      console.log('Accepted orders: ', console.log(this.acceptedOrders));
      console.log('Tentative orders: ', console.log(this.tentativeOrders));    
  }

  async cancelOrder(data: OrderDto){
    this.tentativeOrders = this.tentativeOrders.filter(item => item.phoneNumber !== data.phoneNumber);
    console.log('After cancelling orders: ')
    console.log('Accepted orders: ', console.log(this.acceptedOrders));
    console.log('Tentative orders: ', console.log(this.tentativeOrders));    
  }
}
