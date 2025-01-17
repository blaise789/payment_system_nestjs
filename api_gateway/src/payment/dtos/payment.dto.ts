import { IsNumber, IsPositive } from 'class-validator';

export class PaymentDto {
  @IsNumber()
  @IsPositive()
  amount: number;
}
