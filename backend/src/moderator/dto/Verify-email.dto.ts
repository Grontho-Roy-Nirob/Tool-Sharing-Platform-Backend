import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
export class VerifyEmailDto
{
    @IsNotEmpty({
        message: 'Email is required.',
    })
    @IsEmail({}, {
        message: 'Invalid email address.',
    })
    email!: string;

    @IsNotEmpty({
        message: 'OTP is required.',
    })
    @IsString({
        message: 'OTP must be a string.',
    })
    otp!: string;
}