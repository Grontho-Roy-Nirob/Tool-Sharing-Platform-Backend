import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import {
  HttpException,
  HttpStatus,
 
} from '@nestjs/common';
import { Moderator } from '../entity/moderator.entity';
import { ModeratorEmailVerification } from '../entity/moderator-email-verification.entity';
import { ModeratorPasswordReset } from '../entity/moderator-password-reset.entity';
import { RegisterModeratorDto } from '../dto/register-moderator.dto';
import { ModeratorDocument } from '../entity/moderator-document.entity';
import * as bcrypt from 'bcrypt';
import { error } from 'console';
import { MailService } from '../mail/mail.service';
import { LoginDto } from '../dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { emit } from 'process';
import { VerifyEmailDto } from '../dto/Verify-email.dto';
import { UnauthorizedException } from '@nestjs/common';
import { UserStatus } from '../enums/user-status.enum';
import {ModeratorStatus} from '../enums/moderator-status.enum';
import {ForgotPasswordDto} from '../dto/forgot-password.dto';
import { VerifyResetOtpDto } from '../dto/verify-reset-otp.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';

@Injectable()
export class ModeratorAuthService
{
    constructor(
        @InjectRepository(Moderator)
        private readonly moderatorRepository: Repository<Moderator>,
    
        @InjectRepository(ModeratorDocument)
        private readonly moderatorDocumentRepository: Repository<ModeratorDocument>,
    
        @InjectRepository(ModeratorEmailVerification)
        private readonly moderatorEmailVerificationRepository: Repository<ModeratorEmailVerification>,

        @InjectRepository(ModeratorPasswordReset)
        private readonly moderatroPasswordRestRepository : Repository<ModeratorPasswordReset>,
         private readonly mailService: MailService,
          private readonly jwtService: JwtService,
      )
       {
    
       }


       async registerModerator(
         data: RegisterModeratorDto,
         files: {
           profileImage?: Express.Multer.File[];
           nidFrontImage?: Express.Multer.File[];
           nidBackImage?: Express.Multer.File[];
         },
       ): Promise<any> 
       {
         try {
           // Check if email already exists
           const existingModerator = await this.moderatorRepository.findOne({
             where: {
               email: data.email.trim(),
               
             },
           });
       
           if (existingModerator && existingModerator.emailVerified) {
             throw new HttpException(
               'Email is already registered and verified.',
               HttpStatus.CONFLICT,
             );
           }
       
           // Check if NID already exists
           const existingModeratorDocument =
             await this.moderatorDocumentRepository.findOne({
               where: {
                 nidNumber: data.nidNumber,
               },
             });
       
           if (existingModeratorDocument) {
             throw new HttpException(
               'NID number is already registered.',
               HttpStatus.CONFLICT,
             );
           }
       
           // Validate profile image
           if (!files.profileImage || files.profileImage.length === 0) {
             throw new HttpException(
               'Profile image is required.',
               HttpStatus.BAD_REQUEST,
             );
           }
       
           // Validate NID front image
           if (!files.nidFrontImage || files.nidFrontImage.length === 0) {
             throw new HttpException(
               'NID front image is required.',
               HttpStatus.BAD_REQUEST,
             );
           }
       
           // Validate NID back image
           if (!files.nidBackImage || files.nidBackImage.length === 0) {
             throw new HttpException(
               'NID back image is required.',
               HttpStatus.BAD_REQUEST,
             );
           }
       
           // Hash password
           const salt = await bcrypt.genSalt();
           const hashedPassword = await bcrypt.hash(data.password, salt);
       
           // Uploaded image names
           const profileImage = files.profileImage[0].filename;
           const nidFrontImage = files.nidFrontImage[0].filename;
           const nidBackImage = files.nidBackImage[0].filename;
       
           // Create moderator
           const moderator = this.moderatorRepository.create({
             fullName: data.fullName,
             email: data.email.trim(),
             password: hashedPassword,
             phoneNumber: data.phone,
             profileImage: profileImage,
           });
       
           // Save moderator
           const savedModerator =
             await this.moderatorRepository.save(moderator);
       
           // Create moderator document
           const moderatorDocument =
             this.moderatorDocumentRepository.create({
               moderator: savedModerator,
               nidNumber: data.nidNumber,
               nidFrontImage: nidFrontImage,
               nidBackImage: nidBackImage,
             });
       
           // Save moderator document
           await this.moderatorDocumentRepository.save(
             moderatorDocument,
           );
       
           // Generate OTP
           const otp = Math.floor(
             100000 + Math.random() * 900000,
           ).toString();
       
           // OTP expiry (10 minutes)
           const expiresAt = new Date();
           expiresAt.setMinutes(expiresAt.getMinutes() + 10);
       
           // Create email verification
           const emailVerification =
             this.moderatorEmailVerificationRepository.create({
               moderator: savedModerator,
               otp: otp,
               expiresAt: expiresAt,
               isUsed: false,
             });
       
           // Save email verification
           await this.moderatorEmailVerificationRepository.save(
             emailVerification,
           );
       
           // Send OTP email
           await this.mailService.sendOtpEmail(
             savedModerator.email,
             otp,
           );
       
           // Success response
           return {
             success: true,
             message:
               'Registration successful. An OTP has been sent to your email for verification.',
           };
         } catch (error) {
           if (error instanceof HttpException) {
             throw error;
           }
       
           throw new HttpException(
             'Failed to register moderator.',
             HttpStatus.INTERNAL_SERVER_ERROR,
           );
         }
       }

 async login(
  data: LoginDto,
): Promise<any> {
  try {
    // Find moderator
    const moderator = await this.moderatorRepository.findOne({
      where: {
        email: data.email,
      },
    });

    if (!moderator) {
      throw new HttpException(
        'Invalid email or password.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    // Check account status
    if (moderator.userStatus === UserStatus.INACTIVE) {
      throw new HttpException(
        'Account is not active.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    // Check email verification
    if (!moderator.emailVerified) {
      throw new HttpException(
        'Please verify your email first.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    // Check moderator approval
    if (moderator.status !== ModeratorStatus.APPROVED) {
      throw new HttpException(
        'Your documents are not approved yet.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    // Verify password
    const isPasswordMatched = await bcrypt.compare(
      data.password,
      moderator.password,
    );

    if (!isPasswordMatched) {
      throw new HttpException(
        'Invalid email or password.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    // JWT Payload
    const payload = {
      sub: moderator.moderatorId,
      email: moderator.email,
      role: 'MODERATOR',
    };

    // Check JWT Secret
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is missing from .env');
    }

    // Generate Token
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '30m',
    });

    return {
      success: true,
      message: 'Login successful.',
      accessToken,
      moderator: {
        moderatorId: moderator.moderatorId,
        fullName: moderator.fullName,
        email: moderator.email,
        phoneNumber: moderator.phoneNumber,
        profileImage: moderator.profileImage,
        status: moderator.status,
        emailVerified: moderator.emailVerified,
        userStatus: moderator.userStatus,
      },
    };
  } catch (error) {
    console.error('LOGIN ERROR:', error);

    if (error instanceof HttpException) {
      throw error;
    }

    throw new HttpException(
      'Login failed.',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

        async verifyEmail ( data : VerifyEmailDto ) : Promise<any>
        {
          try 
          {
            const moderator = await this.moderatorRepository.findOne(
                {
                    where :
                    {
                        email : data.email,
                    }
                }
            )
            if(moderator == null)
            {
                throw new HttpException(
                    'Moderator not found.',
                    HttpStatus.NOT_FOUND,
                );
            }
             const emailVerification =
              await this.moderatorEmailVerificationRepository.findOne({
                where: {
                  moderator: {
                    email: data.email.trim(),
                  },
                  otp: data.otp,
                },
                relations: {
                  moderator: true,
                },
              });
        
        
              if(!emailVerification)
              {
                throw new HttpException("invalid otp",
                    HttpStatus.BAD_REQUEST);
              }
                  if (emailVerification.isUsed) {
              throw new HttpException(
                'OTP has already been used.',
                HttpStatus.BAD_REQUEST,
              );
            }
              if (new Date() > emailVerification.expiresAt) {
              throw new HttpException(
                'OTP has expired.',
                HttpStatus.BAD_REQUEST,
              );
            }
            moderator.emailVerified = true;
        
            await this.moderatorRepository.save(moderator);
        
            
            emailVerification.isUsed = true;
        
            await this.moderatorEmailVerificationRepository.save(
              emailVerification,
            );
            await this.mailService.sendEmailVerifiedNotification(
          moderator.email,
        );
        
           return {
          success: true,
          message:
            'Email verified successfully. Please wait for document verification.',
        };
          }
          catch (error) {
            console.error(error);
            throw error;
        }

        }

        async getMyProfile(
  moderatorId: number,
): Promise<any> 
{
    const moderator= await this.moderatorRepository.findOne({
        where :
        {
            moderatorId,
        },
        relations: 
        {
            document : true,
        }
    })
     if (!moderator) {
    throw new HttpException(
      'Moderator not found.',
      HttpStatus.NOT_FOUND,
    );
  }

  return {
    success: true,
    message: 'Profile fetched successfully.',
    data: moderator,
  };
}

async forgotPassword(
  data: ForgotPasswordDto,
): Promise<any> {
  try {

    // Find moderator
    const moderator = await this.moderatorRepository.findOne({
      where: {
        email: data.email,
      },
    });

    if (!moderator) {
      throw new HttpException(
        'Moderator not found.',
        HttpStatus.NOT_FOUND,
      );
    }

    // Check email verification
    if (!moderator.emailVerified) {
      throw new HttpException(
        'Please verify your email first.',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Check account status
    if (moderator.userStatus !== UserStatus.ACTIVE) {
      throw new HttpException(
        'Your account is not active.',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Generate OTP
    const otp = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();

    // OTP expiry time (10 minutes)
    const expiresAt = new Date();
    expiresAt.setMinutes(
      expiresAt.getMinutes() + 10,
    );

    // Delete previous OTP if exists
    await this.moderatroPasswordRestRepository.delete({
      moderator: {
        moderatorId: moderator.moderatorId,
      },
    });

    // Create new password reset record
    const passwordReset =
      this.moderatroPasswordRestRepository.create({
        moderator,
        otp,
        expiresAt,
      });

    await this.moderatroPasswordRestRepository.save(
      passwordReset,
    );

    // Send OTP Email
    await this.mailService.sendPasswordResetOtp(
      moderator.email,
      otp,
    );

    return {
      success: true,
      message:
        'Password reset OTP has been sent successfully.',
    };

  } catch (error) {

    if (error) {
      throw error;
    }

    console.error(error);

    throw new HttpException(
      'Failed to process forgot password request.',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
async verifyResetOtp(
  data: VerifyResetOtpDto,
): Promise<any> {

  try {

    const moderator = await this.moderatorRepository.findOne({
      where: {
        email: data.email,
      },
    });

    if (!moderator) {
      throw new HttpException(
        'Moderator not found.',
        HttpStatus.NOT_FOUND,
      );
    }

    const passwordReset =
      await this.moderatroPasswordRestRepository.findOne({
        where: {
          moderator: {
            moderatorId: moderator.moderatorId,
          },
          otp: data.otp,
        },
      });

    if (!passwordReset) {
      throw new HttpException(
        'Invalid OTP.',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (passwordReset.expiresAt < new Date()) {
      throw new HttpException(
        'OTP has expired.',
        HttpStatus.BAD_REQUEST,
      );
    }

    return {
      success: true,
      message: 'OTP verified successfully.',
    };

  } catch (error) {

    

    console.error(error);

    throw new HttpException(
      'Failed to verify OTP.',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );

  }
}

async resetPassword(
  data: ResetPasswordDto,
): Promise<any> {

  try {

    // Find Moderator
    const moderator =
      await this.moderatorRepository.findOne({
        where: {
          email: data.email,
        },
      });

    if (!moderator) {
      throw new HttpException(
        'Moderator not found.',
        HttpStatus.NOT_FOUND,
      );
    }

    // Password Match
    if (
      data.newPassword !==
      data.confirmPassword
    ) {
      throw new HttpException(
        'Passwords do not match.',
        HttpStatus.BAD_REQUEST,
      );
    }

    //Find OTP
 const passwordReset =
  await this.moderatroPasswordRestRepository.findOne({
    where: {
      moderator: {
        moderatorId: moderator.moderatorId,
      },
      isUsed: false,
    },
    order: {
      createdAt: 'DESC',
    },
  });
    if (!passwordReset) {
      throw new HttpException(
        'Invalid OTP.',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Check Expiry
    if (
      passwordReset.expiresAt <
      new Date()
    ) {
      throw new HttpException(
        'OTP has expired.',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Hash Password
    moderator.password =
      await bcrypt.hash(
        data.newPassword,
        10,
      );

    await this.moderatorRepository.save(
      moderator,
    );

    // Delete OTP
    await this.moderatroPasswordRestRepository.remove(
      passwordReset,
    );

    return {
      success: true,
      message:
        'Password reset successful.',
    };

  } catch (error)
   {

    

    console.error(error);

    throw new HttpException(
      'Failed to reset password.',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );

  }
}

async changePassword(
  moderatorId: number,
  data: ChangePasswordDto,
): Promise<any> {
  try {

    // Find moderator
    const moderator = await this.moderatorRepository.findOne({
      where: {
        moderatorId,
      },
    });

    if (!moderator) {
      throw new HttpException(
        'Moderator not found.',
        HttpStatus.NOT_FOUND,
      );
    }

    // Verify old password
    const isOldPasswordMatched = await bcrypt.compare(
      data.oldPassword,
      moderator.password,
    );

    if (!isOldPasswordMatched) {
      throw new HttpException(
        'Old password is incorrect.',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Check new password and confirm password
    if (data.newPassword !== data.confirmPassword) {
      throw new HttpException(
        'New password and confirm password do not match.',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Prevent using the same password
    const isSamePassword = await bcrypt.compare(
      data.newPassword,
      moderator.password,
    );

    if (isSamePassword) {
      throw new HttpException(
        'New password cannot be the same as the old password.',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Hash new password
    moderator.password = await bcrypt.hash(
      data.newPassword,
      10,
    );

    // Save
    await this.moderatorRepository.save(
      moderator,
    );

    return {
      success: true,
      message: 'Password changed successfully.',
    };

  } catch (error) 
  {


    console.error(error);

    throw new HttpException(
      'Failed to change password.',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
}

       

