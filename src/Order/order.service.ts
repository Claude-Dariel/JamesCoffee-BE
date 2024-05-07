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
  constructor(private readonly httpService: HttpService, private messageService: MessageService, private productService: ProductService) {}
  private acceptedOrders: OrderDto[] = [];
  private tentativeOrders: OrderDto[] = [];
  private products: ProductDTO[] = [];

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
    try {
      const response = await this.productService.findAll();
      this.products = response.data; // Assuming response.data contains the array of ProductDTO
    } catch (error) {
      console.error("Error loading products:", error);
    };

    const requestedProduct = this.products.find(item => item.retailer_id.toString() === data.id);
    const productName = requestedProduct?.description ?? 'NO NAME';
    this.messageService.findAllFromWhatsAppBusiness(data.phoneNumber, data.templateName, [productName, data.price]);
    this.tentativeOrders.push(data);
    console.log('After receiving orders: ')
    console.log('Accepted orders: ', this.acceptedOrders);
    console.log('Tentative orders: ', this.tentativeOrders);    
  }

  async acceptOrder(data: OrderDto){
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

  async cancelOrder(data: OrderDto){
    this.tentativeOrders = this.tentativeOrders.filter(item => item.phoneNumber !== data.phoneNumber);
    console.log('After cancelling orders: ')
    console.log('Accepted orders: ', this.acceptedOrders);
    console.log('Tentative orders: ', this.tentativeOrders);    
  }

  // Method to get accepted orders asynchronously
  async getAcceptedOrdersAsync(): Promise<OrderDto[]> {
    // Simulate an asynchronous operation
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulating asynchronous delay
    
    // Return a promise that resolves with the acceptedOrders array
    return new Promise(resolve => {
      // Check if the acceptedOrders array is already populated
      if (this.acceptedOrders.length > 0) {
        // If it is, resolve the promise immediately with the acceptedOrders array
        resolve(this.acceptedOrders);
      } else {
        // If not, wait for the array to be populated
        const interval = setInterval(() => {
          if (this.acceptedOrders.length > 0) {
            clearInterval(interval); // Stop checking once the array is populated
            resolve(this.acceptedOrders); // Resolve the promise with the acceptedOrders array
          }
        }, 100); // Check every 100 milliseconds
      }
    });
  }
  

  // Method to get accepted orders synchronously
  getAcceptedOrders(): OrderDto[] {
    return this.acceptedOrders;
  }
}
