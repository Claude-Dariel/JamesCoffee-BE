import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';
import { ProductDTO } from 'src/Product/Product.dto';
import { OrderDto } from './order.dto';
import { MessageService } from 'src/message/message.service';
import { ProductService } from 'src/Product/product.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class OrderService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache, private readonly httpService: HttpService, private messageService: MessageService) { }
  private acceptedOrders: OrderDto[] = [
    {
      id: "27793387630",
      price: "R50.00",
      name: "Sizwe Tshabangu",
      phoneNumber: "27793387630",
      templateName: '',
      products: [
        {
          id: "1",
          description: "Chakalaka Chai",
          price: 30.00
        },
        {
          id: "2",
          description: "Rooibos Latte",
          price: 40.00
        }
      ]
    },
    {
      id: "27814956903",
      price: "R60.00",
      name: "Gerald Kirui",
      phoneNumber: "27814956903",
      templateName: '',
      products: [
        {
          id: "2",
          description: "Rooibos Latte",
          price: 60.00
        }
      ]
    }
  ];

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
    // console.log('Products: ', this.products);
    // const requestedProduct = this.products.find(item => item.retailer_id.toString() === data.id);
    // console.log('Requested product: ', requestedProduct);
    const productName = 'NO NAME';
    console.log("Product name", data.phoneNumber);
    console.log("Template name", data.templateName);
    console.log("Product name", productName);
    console.log("Price", data.price);
    this.messageService.findAllFromWhatsAppBusiness(data.phoneNumber, data.templateName, [productName, data.price]);
    
    let currentTentativeOrdersforThisIndividual = await this.cacheManager.get(`tentative-${data.phoneNumber}`) as OrderDto[];

    if (currentTentativeOrdersforThisIndividual === undefined || currentTentativeOrdersforThisIndividual === null) {
      currentTentativeOrdersforThisIndividual = []; // Initialize as empty array if undefined or null
    }

    currentTentativeOrdersforThisIndividual.push(data);
    await this.cacheManager.set(`tentative-${data.phoneNumber}`, currentTentativeOrdersforThisIndividual);//this.tentativeOrders.push(data);

    console.log('After receiving orders: ')
    console.log('Accepted orders: ', []);
    console.log('Tentative orders: ', currentTentativeOrdersforThisIndividual);
  }

  async acceptOrder(data: OrderDto) {
    let currentTentativeOrdersforThisIndividual = await this.cacheManager.get(`tentative-${data.phoneNumber}`) as OrderDto[];
    let currentAcceptedOrdersforThisIndividual = await this.cacheManager.get(`accepted-${data.phoneNumber}`) as OrderDto[];
    console.log('Before accepting orders: ')
    console.log('Accepted orders: ', currentAcceptedOrdersforThisIndividual);
    console.log('Tentative orders: ', currentTentativeOrdersforThisIndividual);

    const order = currentTentativeOrdersforThisIndividual.find(item => item.phoneNumber === data.phoneNumber);

    if (order) {
      if(currentAcceptedOrdersforThisIndividual !== undefined && currentAcceptedOrdersforThisIndividual !== null){
        currentAcceptedOrdersforThisIndividual.push(order);
      }      
      else{
        currentAcceptedOrdersforThisIndividual = [];
        currentAcceptedOrdersforThisIndividual.push(order);
      }
      //this.tentativeOrders = this.tentativeOrders.filter(item => item.phoneNumber !== data.phoneNumber);
      currentTentativeOrdersforThisIndividual = currentTentativeOrdersforThisIndividual.filter(item => item.phoneNumber !== data.phoneNumber);
      await this.cacheManager.set(`tentative-${data.phoneNumber}`, currentTentativeOrdersforThisIndividual, 0);//this.tentativeOrders.push(data);
      await this.cacheManager.set(`accepted-${data.phoneNumber}`, currentAcceptedOrdersforThisIndividual, 0);
    } else {
      console.log('Order not found in tentative orders');
    }
    console.log('After accepting orders: ')
    console.log('Accepted orders: ', currentAcceptedOrdersforThisIndividual);
    console.log('Tentative orders: ', currentTentativeOrdersforThisIndividual);
  }

  async cancelOrder(data: OrderDto) {
    let currentTentativeOrdersforThisIndividual = await this.cacheManager.get(`tentative-${data.phoneNumber}`) as OrderDto[];
    currentTentativeOrdersforThisIndividual = currentTentativeOrdersforThisIndividual.filter(item => item.phoneNumber !== data.phoneNumber);
    await this.cacheManager.set(`tentative-${data.phoneNumber}`, currentTentativeOrdersforThisIndividual, 0);
    console.log('After cancelling orders: ')
    console.log('Tentative orders: ', currentTentativeOrdersforThisIndividual);
  }

  // Method to get accepted orders asynchronously
  async getAcceptedOrdersAsync(): Promise<OrderDto[]> {
    let currentAcceptedOrdersforThisIndividual = await this.cacheManager.get(`accepted-27814956903`) as OrderDto[];

    if(currentAcceptedOrdersforThisIndividual === undefined || currentAcceptedOrdersforThisIndividual === null){
      currentAcceptedOrdersforThisIndividual = [];
    }

    return new Promise(resolve => {
      resolve(currentAcceptedOrdersforThisIndividual);
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
