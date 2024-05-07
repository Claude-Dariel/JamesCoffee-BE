export interface OrderDto {
  id: string;
  price: string;
  name?: string;
  phoneNumber: string;
  templateName: string;
  customerResponse?: string;
}
