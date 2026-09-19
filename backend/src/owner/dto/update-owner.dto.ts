import {
  IsEmail,
  IsNumberString,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class UpdateOwnerDTO {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @MinLength(6)
  password?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsNumberString()
  @Matches(/^\d{10}$/, {
    message: 'NID number must be exactly 10 digits',
  })
  nidNumber?: string;

  @IsOptional()
  @IsString()
  profile_image?: string;
}