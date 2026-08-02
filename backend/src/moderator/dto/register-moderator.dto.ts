import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class RegisterModeratorDto {
  @IsNotEmpty(
    { 
        message: 'Full name is required.' 
    })
  @IsString(
    {
         message: 'Full name must be a string.' 
        }
    )
  @Length(3, 150, 
    {
    message: 'Full name must be between 3 and 150 characters.',
  })
  @Matches(/^[A-Za-z\s]+$/, 
    {
    message: 'Full name can contain only letters and spaces.',
  })
  fullName!: string;

  @IsNotEmpty({ message: 'Email is required.' })
  @IsEmail({}, {
    message: 'Please enter a valid email address.',
  })
  email!: string;

  @IsNotEmpty(
    { message: 'Password is required.' }
)
  @Length(8, 30, {
    message: 'Password must be between 8 and 30 characters.',
  })
  password!: string;

  @IsNotEmpty({ message: 'Phone number is required.' })
  @Matches(/^01[3-9]\d{8}$/, {
    message: 'Please enter a valid Bangladeshi phone number.',
  })
  phone!: string;

  @IsNotEmpty({
     message: 'NID number is required.' }
    )
  @Matches(/^(\d{10}|\d{13}|\d{17})$/,
     {
    message: 'NID number must contain 10, 13, or 17 digits.',
  })
  nidNumber!: string;
}