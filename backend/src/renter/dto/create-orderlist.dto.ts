import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateOrderListDto {
  @IsInt()
  tool_id!: number;
  @IsDateString()
  start_date!: string;
  @IsDateString()
  end_date!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  message?: string;
}
