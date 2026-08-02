import { IsEnum } from 'class-validator';
import { ModeratorStatus } from '../enums/moderator-status.enum';

export class VerifyModeratorDocumentDto {

  @IsEnum(ModeratorStatus, {
    message: 'Invalid moderator status.',
  })
  status!: ModeratorStatus;

}