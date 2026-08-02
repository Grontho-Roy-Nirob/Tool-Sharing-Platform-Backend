import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import {
  HttpException,
  HttpStatus,
 
} from '@nestjs/common';

import { Moderator } from './entity/moderator.entity';
import { ModeratorEmailVerification } from './entity/moderator-email-verification.entity';
import { ModeratorPasswordReset } from './entity/moderator-password-reset.entity';  
import { RegisterModeratorDto } from './dto/register-moderator.dto';
import { ModeratorDocument } from './entity/moderator-document.entity';
import * as bcrypt from 'bcrypt';
import { error } from 'console';
import { MailService } from './mail/mail.service';
import { VerifyEmailDto } from './dto/Verify-email.dto';
import { VerifyModeratorDocumentDto } from './dto/verify-moderator-document.dto';
import { ModeratorStatus } from './enums/moderator-status.enum';
import { UserStatus } from './enums/user-status.enum';
@Injectable()
export class ModeratorService 
{
        constructor(
    @InjectRepository(Moderator)
    private readonly moderatorRepository: Repository<Moderator>,

    @InjectRepository(ModeratorDocument)
    private readonly moderatorDocumentRepository: Repository<ModeratorDocument>,

    @InjectRepository(ModeratorEmailVerification)
    private readonly moderatorEmailVerificationRepository: Repository<ModeratorEmailVerification>,
     private readonly mailService: MailService,
  )
  
   {

   }





async  verifyModeratorDocument(
    moderatorId : number,
    data: VerifyModeratorDocumentDto
): Promise<any>
{
    try 
    {
            const moderator = await this.moderatorRepository.findOne(
                {
                    where :
                    {
                        moderatorId : moderatorId,
                    }
                }
            );
            if(!moderator)
            {
                throw new HttpException(
                    'Moderator not found.',
                    HttpStatus.NOT_FOUND,
                );
            }
            if(!moderator.emailVerified)
            {
                throw new HttpException("moderator email is not verified",
                    HttpStatus.BAD_REQUEST);
            }

            if(moderator.status ==ModeratorStatus.APPROVED)
            {
                throw new HttpException("moderator is already approved",
                    HttpStatus.BAD_REQUEST);
            }
                
            moderator.status = data.status;
            moderator.userStatus=UserStatus.ACTIVE;
            await this.moderatorRepository.save(moderator);

            if(moderator.status == ModeratorStatus.APPROVED)
            {
                // Send approval notification
                await this.mailService.sendModeratorApprovedEmail(
                    moderator.email,
                    moderator.fullName
                );
            }

            if(moderator.status == ModeratorStatus.REJECTED)
            {
                await this.mailService.sendModeratorRejectedEmail(
                    moderator.email,
                    moderator.fullName
                );
            }
            return {
                success: true,
                message : `Moderator document has been ${moderator.status.toLowerCase()}.`,
            }
    }
    catch (error)
    {
        console.error(error);
        throw new HttpException(
            'Failed to verify moderator document.',
            HttpStatus.INTERNAL_SERVER_ERROR,
        );
    }
}

async getAllModerators(): Promise<any> {
  try {

    const moderators =
      await this.moderatorRepository.find({
        relations: {
          document: true,
        },
        order: {
          createdAt: 'DESC',
        },
      });

    return {
      success: true,
      message: 'Moderators fetched successfully.',
      total: moderators.length,
      data: moderators,
    };

  } catch (error) {

    console.error(error);

    throw new HttpException(
      'Failed to fetch moderators.',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}


async getInactiveModerators(): Promise<any> {
  try {

    const moderators =
      await this.moderatorRepository.find({
        where: {
          userStatus: UserStatus.INACTIVE,
        },
        relations: {
          document: true,
        },
        order: {
          createdAt: 'DESC',
        },
      });

    return {
      success: true,
      message: 'Inactive moderators fetched successfully.',
      total: moderators.length,
      data: moderators,
    };

  } catch (error) {

    console.error(error);

    throw new HttpException(
      'Failed to fetch inactive moderators.',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}


async getPendingDocumentModerators(): Promise<any> {
  try {

    const moderators =
      await this.moderatorRepository.find({
        where: {
          status: ModeratorStatus.PENDING,
        },
        relations: {
          document: true,
        },
        order: {
          createdAt: 'DESC',
        },
      });

    return {
      success: true,
      message: 'Pending document moderators fetched successfully.',
      total: moderators.length,
      data: moderators,
    };

  } catch (error) {

    console.error(error);

    throw new HttpException(
      'Failed to fetch pending document moderators.',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

async inactiveModerator(
  moderatorId: number,
): Promise<any> {

  try {

    const moderator =
      await this.moderatorRepository.findOne({
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

    if (moderator.userStatus === UserStatus.INACTIVE) {
      throw new HttpException(
        'Moderator is already inactive.',
        HttpStatus.BAD_REQUEST,
      );
    }

    moderator.userStatus = UserStatus.INACTIVE;

    await this.moderatorRepository.save(
      moderator,
    );

    return {
      success: true,
      message: 'Moderator has been deactivated successfully.',
    };

  } catch (error) {

   

    console.error(error);

    throw new HttpException(
      'Failed to deactivate moderator.',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}


async getModeratorById(
  moderatorId: number,
): Promise<any> {

  try {

    const moderator =
      await this.moderatorRepository.findOne({

        where: {
          moderatorId,
        },

        relations: {
          document: true,
          
        },

      });

    if (!moderator) {

      throw new HttpException(
        'Moderator not found.',
        HttpStatus.NOT_FOUND,
      );

    }

    return {

      success: true,

      message:
        'Moderator fetched successfully.',

      data: moderator,

    };

  } catch (error) {

    if (error instanceof HttpException) {
      throw error;
    }

    console.error(error);

    throw new HttpException(
      'Failed to fetch moderator.',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );

  }

}


async activeModerator(
  moderatorId: number,
): Promise<any> {

  try {

    const moderator =
      await this.moderatorRepository.findOne({
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

    if (moderator.userStatus === UserStatus.ACTIVE) {
      throw new HttpException(
        'Moderator is already active.',
        //400
        HttpStatus.BAD_REQUEST,
      );
    }

    moderator.userStatus = UserStatus.ACTIVE;

    await this.moderatorRepository.save(
      moderator,
    );

    return {
      success: true,
      message: 'Moderator has been activated successfully.',
    };

  } catch (error) {

    if (error instanceof HttpException) {
      throw error;
    }

    console.error(error);

    throw new HttpException(
      'Failed to activate moderator.',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );

  }

}


}