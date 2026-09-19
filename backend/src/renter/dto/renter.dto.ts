import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

import { RenterRole } from '../entity/renter.entity';

export class CreateRenterDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  fullName: string;

  @IsEmail()
  @MaxLength(255)
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(255)
  password: string;

  @IsOptional()
  @IsPhoneNumber('BD')
  phone?: string;

  // Stores uploaded image filename (e.g. 1723123456789-photo.jpg)
  @IsOptional()
  @IsString()
  profileImage?: string;

  @IsNotEmpty()
  @IsNumberString()
  nidNumber: string;
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class UpdateRenterDto {
  @IsOptional()
  @IsString()
  @MaxLength(150)
  fullName?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(255)
  password?: string;

  @IsOptional()
  @IsPhoneNumber('BD')
  phone?: string;

  @IsOptional()
  @IsString()
  profileImage?: string;

  @IsOptional()
  @IsNumberString()
  nidNumber?: string;

  @IsOptional()
  @IsEnum(RenterRole)
  role?: RenterRole;
}
