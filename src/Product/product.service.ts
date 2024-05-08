import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom, take } from 'rxjs';
import { ProductDTO } from './Product.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ProductService {
  private parameters =
    'fields=["name", "retailer_id", "description", "availability", "price", "image_url", "inventory"]';
  private url = `${this.configService.get('FACEBOOK_GRAPH')}/${this.configService.get('CLOUD_API_VERSION')}`;
  private catalogId = this.configService.get('PRODUCT_CATALOG_ID');
  private logger = new Logger();
  constructor(
    private readonly httpService: HttpService,
    private configService: ConfigService,
  ) {}

  async findAll() {
    console.log(`${this.url}/${this.catalogId}/products?${this.parameters}`);
    this.logger.debug('findAll');
    try {
      const response = await this.httpService
        .get(`${this.url}/${this.catalogId}/products?${this.parameters}`)
        .pipe(
          take(1), // Ensure that the observable completes after emitting the first value
          catchError((error: AxiosError) => {
            this.logger.error(error);
            throw error;
          }),
        )
        .toPromise(); // Convert observable to promise
      
      if (!response) {
        throw new Error('Response is undefined');
      }
  
      return response.data; // Assuming the data is in the 'data' property of the response
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
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
