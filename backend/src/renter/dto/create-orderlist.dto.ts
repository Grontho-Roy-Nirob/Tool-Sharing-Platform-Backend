import {
  IsArray,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  ArrayMinSize,
} from 'class-validator';

export class CreateOrderListDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  tool_ids!: number[];

  @IsDateString()
  start_date!: string;
  @IsDateString()
  end_date!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  message?: string;
}
