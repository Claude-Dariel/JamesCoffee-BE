import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { AxiosError, AxiosResponse } from 'axios';
import { ProductDTO } from './Product.dto';

interface FaceBookResponse {
  data: ProductDTO[];
}
interface FBResponse {
  data: ProductDTO;
}

@Controller('products')
export class ProductController {
  constructor(private productService: ProductService) {}

  @Get()
  async findAll() {
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

  @Get(':id')
  async findById(@Param('id') id: number) {
    return await this.productService
      .findById(id)
      .then((axiosResponse: AxiosResponse<FBResponse>) => axiosResponse.data)
      .catch((error) => {
        console.log(error);
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST, {
          cause: error,
        });
      });
  }

  @Post()
  async create(@Body() product: ProductDTO) {
    return await this.productService
      .create(product)
      .then((axiosResponse: AxiosResponse) => axiosResponse.data)
      .catch((error) => {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      });
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() product: ProductDTO) {
    return await this.productService
      .update(id, product)
      .then((axiosResponse: AxiosResponse<FBResponse>) => axiosResponse.data)
      .catch((error: AxiosError) => {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      });
  }

  @Delete('id')
  async delete(@Param('id') id: number) {
    return await this.productService
      .delete(id)
      .then((axiosResponse: AxiosResponse) => {
        return axiosResponse.data;
      })
      .catch((error) => {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      });
  }
}
