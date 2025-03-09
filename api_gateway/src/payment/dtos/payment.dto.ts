import { IsNumber, IsPositive, IsString } from 'class-validator';

export class PaymentDto {
  @IsString()
  userId: string;
  @IsNumber()
  @IsPositive()
  amount: number;
  @IsString()
  currency: string;
  @IsNumber()
  quantity: number;
}
