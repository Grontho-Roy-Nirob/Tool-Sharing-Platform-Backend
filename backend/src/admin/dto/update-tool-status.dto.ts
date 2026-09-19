import { IsEnum } from 'class-validator';
import { ToolStatus } from '../../owner/entity/tool.entity';

export class UpdateToolStatusDto {
  @IsEnum(ToolStatus)
  status!: ToolStatus;
}
