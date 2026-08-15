import { IsInt, Min } from 'class-validator';

export class CreatePaymentDto {
  @IsInt()
  @Min(1)
  order_id!: number;
}
