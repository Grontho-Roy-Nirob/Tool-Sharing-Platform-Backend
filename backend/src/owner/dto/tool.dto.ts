import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';

export class ToolDTO {
  @IsNotEmpty()
  @IsString()
  tool_name!: string;

  @IsNotEmpty()
  @IsString()
  description!: string;

  @IsNotEmpty()
  @IsString()
  brand!: string;

  @IsNotEmpty()
  @IsString()
  condition!: string;

  rental_price_per_day!: number;

  @IsNotEmpty()
  @IsString()
  location!: string;

  category_id!: number;

  tool_image!: string;
}
