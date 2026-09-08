import { IsEmail, IsNotEmpty, IsNumberString, IsString, Matches, MinLength } from 'class-validator';

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

  @IsNumberString()
  @Matches(/^\d{10}$/, {
    message: 'NID number must be exactly 10 digits',
  })
  nidNumber!: string;

  profile_image!: string;

  role!: string;
}

export class loginDTO {
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  password!: string;
}
