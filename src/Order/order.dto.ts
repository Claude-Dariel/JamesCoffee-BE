import { ProductDTO } from "src/Product/Product.dto";

export interface OrderDto {
  id: string;
  price: string;
  name?: string;
  phoneNumber: string;
  templateName: string;
  customerResponse?: string;
  products?: ProductDTO[];
}
