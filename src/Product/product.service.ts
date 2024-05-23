import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom, lastValueFrom, take } from 'rxjs';
import { ProductDTO } from './Product.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ProductService {
  private parameters =
    'fields=["name", "retailer_id", "description", "availability", "price", "image_url", "inventory"]';
  private url = `${this.configService.get('FACEBOOK_GRAPH')}/${this.configService.get('CLOUD_API_VERSION')}`;
  private catalogId = this.configService.get('PRODUCT_CATALOG_ID');
  private logger = new Logger();
  private allProducts: ProductDTO[] = [
    {
      "name": "Chakalaka Chai",
      "retailer_id": 2,
      "description": "Infuse your chai latte with a hint of chakalaka spice.",
      "availability": "in stock",
      "price": 30.00,
      "image_link": "https://whatsapp-business-coffee.s3.af-south-1.amazonaws.com/757ac4c9-fb1c-4f26-9f92-b002f625db9b.jpg",
      "id": "25385653507717232"
    },
    {
      "name": "Koeksister Frappé",
      "retailer_id": 1,
      "description": "Turn the beloved koeksister pastry into a refreshing frappé.",
      "availability": "in stock",
      "price": 40.00,
      "image_link": "https://whatsapp-business-coffee.s3.af-south-1.amazonaws.com/8195434b-f96f-4ac7-9801-d3962c56d4ba.jpg",
      "id": "8775704099130475"
    },
    {
      "name": "Rooibos Latte",
      "retailer_id": 5,
      "description": "A soothing blend of rooibos tea and steamed milk, perfect for those who prefer a caffeine-free option.",
      "availability": "in stock",
      "price": 30.00,
      "image_link": "https://whatsapp-business-coffee.s3.af-south-1.amazonaws.com/2dfa93a3-3759-46c3-80be-2c6427613e9c.jpg",
      "id": "7776811345703072"
    },
    {
      "name": "Malva Pudding Mocha",
      "retailer_id": 3,
      "description": "Combine the flavors of Malva Pudding (a traditional South African dessert) with a rich mocha.",
      "availability": "in stock",
      "price": 50.00,
      "image_link": "https://whatsapp-business-coffee.s3.af-south-1.amazonaws.com/5cabada0-aff9-4edb-868f-5781ce1199fd.jpg",
      "id": "7572416456151104"
    },
    {
      "name": "Amarula Cappuccino",
      "retailer_id": 4,
      "description": "Elevate your cappuccino by adding a splash of Amarula, a creamy liqueur made from the indigenous marula fruit.",
      "availability": "in stock",
      "price": 40.00,
      "image_link": "https://whatsapp-business-coffee.s3.af-south-1.amazonaws.com/3cfb1870-4547-43ba-bce2-345bcbaf8074.jpg",
      "id": "7301079679982572"
    }];

  constructor(
    private readonly httpService: HttpService,
    private configService: ConfigService,
  ) {

  }

  private async initializeProducts(): Promise<void> {
    try {
      this.allProducts = (await this.findAll()).data.data; // Example: Assuming getProducts() returns a Promise<ProductDTO[]>
    } catch (error) {
      console.error('Error initializing products:', error);
    }
  }

  async getAllProducts(): Promise<ProductDTO[]> {
    // try {
    //   //this.allProducts = (await this.findAll()).data.data; // Example: Assuming getProducts() returns a Promise<ProductDTO[]>
    // } catch (error) {
    //   console.error('Error initializing products:', error);
    // }
    return this.allProducts;
  }

  async findAll() {
    console.log(`${this.url}/${this.catalogId}/products?${this.parameters}`);
    this.logger.debug('findAll');
    return await lastValueFrom(
      this.httpService
        .get(`${this.url}/${this.catalogId}/products?${this.parameters}`)
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error);
            throw error;
          }),
        ),
    );
  }

  async findById(id: number) {
    this.logger.debug(`findById(${id})`);
    return await firstValueFrom(
      this.httpService.get(`${this.url}/${id}?${this.parameters}`).pipe(
        catchError((error: AxiosError) => {
          this.logger.error(error);
          throw error;
        }),
      ),
    );
  }

  async create(product: ProductDTO) {
    this.logger.debug(`create() product: ${product}`);
    return await firstValueFrom(
      this.httpService
        .post(`${this.url}/${this.catalogId}/products`, {
          data: product,
        })
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error);
            throw error;
          }),
        ),
    );
  }

  async update(id: number, product: ProductDTO) {
    this.logger.debug(`update(${id}) product: ${product}`);
    return await firstValueFrom(
      this.httpService
        .put(`${this.url}/${id}`, {
          data: product,
        })
        .pipe(
          catchError((error) => {
            this.logger.error(error);
            throw error;
          }),
        ),
    );
  }

  async delete(id: number) {
    this.logger.debug(`delete(${id})`);
    return await firstValueFrom(
      this.httpService.delete(`${this.url}/${id}`).pipe(
        catchError((error) => {
          this.logger.error(error);
          throw error;
        }),
      ),
    );
  }
}
