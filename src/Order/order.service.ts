import { HttpService } from '@nestjs/axios';
import { HttpException, Inject, Injectable } from '@nestjs/common';
import { AxiosError, AxiosResponse } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';
import { ProductDTO } from 'src/Product/Product.dto';
import { OrderDto } from './order.dto';
import { MessageService } from 'src/message/message.service';
import { ProductService } from 'src/Product/product.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

interface FaceBookResponse {
  data: ProductDTO[];
}

@Injectable()
export class OrderService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache, private readonly httpService: HttpService, private messageService: MessageService, private productService: ProductService) { }
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

  private async getAllProducts(){
    return await this.productService
      .findAll()
      .then(
        (axiosResponse: AxiosResponse<FaceBookResponse>) =>
          axiosResponse.data.data,
      )
      .catch((error: AxiosError) => {
        throw new HttpException(error.message, error.status as number);
      });
  }

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

  async receiveOrder(data: OrderDto): Promise<void> {
    let allCustomers = await this.getValueFromCache(this.customerKey) as string[];
    this.addToSetIfNotExists(allCustomers, data.phoneNumber);
    await this.cacheManager.set(this.customerKey, allCustomers, 0);

    const productName = 'NO NAME';

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
    let allProducts = await this.getAllProducts();
    console.log('All products: ', allProducts);

    let allCustomers = await this.getValueFromCache(this.customerKey) as string[];

    let allAcceptedOrders: OrderDto[] = [];

    for (const customer of allCustomers) {
      let orderKey = this.combinePrefixToKey(this.acceptedKey, customer);
      console.log('Order key: ', orderKey);
      let currentAcceptedOrdersforThisIndividual = await this.getValueFromCache(orderKey) as OrderDto[];
      console.log('Checking what is in accepted orders cache: ', currentAcceptedOrdersforThisIndividual);
      allAcceptedOrders = allAcceptedOrders.concat(currentAcceptedOrdersforThisIndividual);
    }

    console.log('All accepted orders: ', allAcceptedOrders);

    return new Promise(resolve => {
      resolve(allAcceptedOrders);
      console.log('Checking resolve accepted orders');
    }
    );
  }

  async notifyCustomerOfPreparation(order_id: string) {

    let allAcceptedOrders = await this.getAcceptedOrdersAsync();
    let thisOrder = allAcceptedOrders.find(item => item.id === order_id);
    let phone_number = thisOrder?.phoneNumber;

    if (phone_number) {
      this.messageService.findAllFromWhatsAppBusiness(phone_number, 'order_prepare', []);
    }
    else {
      console.log('Could not notify customer');
    }
  }

  async notifyCustomerOfCompletion(order_id: string) {

    let allAcceptedOrders = await this.getAcceptedOrdersAsync();
    let thisOrder = allAcceptedOrders.find(item => item.id === order_id);
    let phone_number = thisOrder?.phoneNumber;

    if (phone_number) {
      this.messageService.findAllFromWhatsAppBusiness(phone_number, 'order_complete', []);
    }
    else {
      console.log('Could not notify customer');
    }
  }
}
