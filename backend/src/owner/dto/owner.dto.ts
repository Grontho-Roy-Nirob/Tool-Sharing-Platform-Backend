import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class OwnerDTO {
  
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @MinLength(6)
  password!: string;

  @IsNotEmpty()
  phone!: string;

  profile_image!: string; 

  role!: string;
}

export class loginDTO {
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  password!: string;
}