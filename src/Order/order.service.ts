import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';
import { ProductDTO } from 'src/Product/Product.dto';
import { OrderDto } from './order.dto';
import { MessageService } from 'src/message/message.service';
import { ProductService } from 'src/Product/product.service';

@Injectable()
export class OrderService {
  constructor(private readonly httpService: HttpService, private messageService: MessageService) { }
  private acceptedOrders: OrderDto[] = [ ];

  private tentativeOrders: OrderDto[] = [];
  private products: ProductDTO[] = [];
  productService: any;

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

  async receiveOrder(data: OrderDto): Promise<void> {
    try {
      const response = await this.productService.findAll();
      this.products = response.data; // Assuming response.data contains the array of ProductDTO
    } catch (error) {
      console.error("Error loading products:", error);
    };
    console.log('Products: ', this.products);
    const requestedProduct = this.products.find(item => item.retailer_id.toString() === data.id);
    console.log('Requested product: ', requestedProduct);
    const productName = requestedProduct?.description ?? ' ';
    this.messageService.findAllFromWhatsAppBusiness(data.phoneNumber, data.templateName, [productName, data.price]);
    this.tentativeOrders.push(data);
    console.log('After receiving orders: ')
    console.log('Accepted orders: ', this.acceptedOrders);
    console.log('Tentative orders: ', this.tentativeOrders);
  }

  async acceptOrder(data: OrderDto) {
    console.log('Before accepting orders: ')
    console.log('Accepted orders: ', this.acceptedOrders);
    console.log('Tentative orders: ', this.tentativeOrders);
    const order = this.tentativeOrders.find(item => item.phoneNumber === data.phoneNumber);
    if (order) {
      this.acceptedOrders.push(order);
      //this.tentativeOrders = this.tentativeOrders.filter(item => item.phoneNumber !== data.phoneNumber);
    } else {
      console.log('Order not found in tentative orders');
    }
    console.log('After accepting orders: ')
    console.log('Accepted orders: ', this.acceptedOrders);
    console.log('Tentative orders: ', this.tentativeOrders);
  }

  async cancelOrder(data: OrderDto) {
    this.tentativeOrders = this.tentativeOrders.filter(item => item.phoneNumber !== data.phoneNumber);
    console.log('After cancelling orders: ')
    console.log('Accepted orders: ', this.acceptedOrders);
    console.log('Tentative orders: ', this.tentativeOrders);
  }

  // Method to get accepted orders asynchronously
  async getAcceptedOrdersAsync(): Promise<OrderDto[]> {

    return new Promise(resolve => {
      resolve(this.acceptedOrders);
      console.log('Checking resolve accepted orders');
    }
    );
  }

  // Method to get accepted orders synchronously
  getAcceptedOrders(): OrderDto[] {
    return this.acceptedOrders;
  }

  async notifyCustomerOfPreparation(order_id: string) {
    let thisOrder = this.acceptedOrders.find(item => item.id === order_id);
    let phone_number = thisOrder?.phoneNumber;

    if (phone_number) {
      this.messageService.findAllFromWhatsAppBusiness(phone_number, 'order_prepare', []);
    }
    else {
      console.log('Could not notify customer');
    }
  }

  async notifyCustomerOfCompletion(order_id: string) {
    let thisOrder = this.acceptedOrders.find(item => item.id === order_id);
    let phone_number = thisOrder?.phoneNumber;

    if (phone_number) {
      this.messageService.findAllFromWhatsAppBusiness(phone_number, 'order_complete', []);
    }
    else {
      console.log('Could not notify customer');
    }
  }
}
