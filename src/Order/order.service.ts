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
  private customerKey = 'customers';
  private tentativeKey = 'tentative';
  private acceptedKey = 'accepted';

  private async getValueFromCache(key: string): Promise<unknown> {
    let output = await this.cacheManager.get(key);
    if (output === undefined || output === null) {
      output = [];
    }
    return output;
  }

  private combinePrefixToKey(prefix: string, key: string): string {
    return `${prefix}-${key}`;
  }

  private addToSetIfNotExists(array: string[], element: string) {
    if (!array.includes(element)) {
      array.push(element);
    }
  }

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
    let allCustomers = await this.getValueFromCache(this.customerKey) as string[];
    this.addToSetIfNotExists(allCustomers, data.phoneNumber);
    await this.cacheManager.set(this.customerKey, allCustomers, 0);

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

    let orderKey = this.combinePrefixToKey(this.tentativeKey, data.phoneNumber);
    let currentTentativeOrdersforThisIndividual = await this.getValueFromCache(orderKey) as OrderDto[];

    currentTentativeOrdersforThisIndividual.push(data);
    await this.cacheManager.set(orderKey, currentTentativeOrdersforThisIndividual, 0);//this.tentativeOrders.push(data);

    console.log('After receiving orders: ')
    console.log('Accepted orders: ', []);
    console.log('Tentative orders: ', currentTentativeOrdersforThisIndividual);
  }

  async acceptOrder(data: OrderDto) {
    let tentativeOrderKey = this.combinePrefixToKey(this.tentativeKey, data.phoneNumber);
    let currentTentativeOrdersforThisIndividual = await this.getValueFromCache(tentativeOrderKey) as OrderDto[];

    let acceptedOrderKey = this.combinePrefixToKey(this.acceptedKey, data.phoneNumber);
    let currentAcceptedOrdersforThisIndividual = await this.getValueFromCache(acceptedOrderKey) as OrderDto[];

    console.log('Before accepting orders: ')
    console.log('Accepted orders: ', currentAcceptedOrdersforThisIndividual);
    console.log('Tentative orders: ', currentTentativeOrdersforThisIndividual);

    const order = currentTentativeOrdersforThisIndividual.find(item => item.phoneNumber === data.phoneNumber);

    if (order) {
      currentAcceptedOrdersforThisIndividual.push(order);
      //this.tentativeOrders = this.tentativeOrders.filter(item => item.phoneNumber !== data.phoneNumber);
      currentTentativeOrdersforThisIndividual = currentTentativeOrdersforThisIndividual.filter(item => item.phoneNumber !== data.phoneNumber);
      await this.cacheManager.set(tentativeOrderKey, currentTentativeOrdersforThisIndividual, 0);//this.tentativeOrders.push(data);
      await this.cacheManager.set(acceptedOrderKey, currentAcceptedOrdersforThisIndividual, 0);
    } else {
      console.log('Order not found in tentative orders');
    }
    console.log('After accepting orders: ')
    console.log('Accepted orders: ', currentAcceptedOrdersforThisIndividual);
    console.log('Tentative orders: ', currentTentativeOrdersforThisIndividual);
  }

  async cancelOrder(data: OrderDto) {
    let orderKey = this.combinePrefixToKey(this.tentativeKey, data.phoneNumber);
    let currentTentativeOrdersforThisIndividual = await this.getValueFromCache(orderKey) as OrderDto[];
    currentTentativeOrdersforThisIndividual = currentTentativeOrdersforThisIndividual.filter(item => item.phoneNumber !== data.phoneNumber);
    await this.cacheManager.set(orderKey, currentTentativeOrdersforThisIndividual, 0);
    console.log('After cancelling orders: ')
    console.log('Tentative orders: ', currentTentativeOrdersforThisIndividual);
  }

  // Method to get accepted orders asynchronously
  async getAcceptedOrdersAsync(): Promise<OrderDto[]> {
    let allCustomers = await this.getValueFromCache(this.customerKey) as string[];

    let allAcceptedOrders: OrderDto[] = [];

    for (const customer of allCustomers) {
      let orderKey = this.combinePrefixToKey(this.acceptedKey, customer);
      let currentAcceptedOrdersforThisIndividual = await this.getValueFromCache(orderKey) as OrderDto[];
      allAcceptedOrders.concat(currentAcceptedOrdersforThisIndividual);
    }

    return new Promise(resolve => {
      resolve(allAcceptedOrders);
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
