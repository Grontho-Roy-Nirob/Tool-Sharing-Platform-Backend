import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
  ) 
  {

  }
  async sendMail(
    to: string,
    subject: string,
    text: string,
  ): Promise<void> {
    await this.mailerService.sendMail({
      to,
      subject,
      text,
    });
  }

  async sendOtpEmail(
    email: string,
    otp: string,
  ): Promise<void> {

    const subject = 'Email Verification';

    const text = `Hello,

Your verification code is: ${otp}

This OTP will expire in 10 minutes.

Thank you.`;

    await this.sendMail(
      email,
      subject,
      text,
    );
  }
  async sendEmailVerifiedNotification(
  email: string,
): Promise<void> {

  const subject = 'Email Verification Successful';

  const text = `Hello,

Congratulations!

Your email has been verified successfully.

Your account is not fully active yet.

Our team will now review your submitted NID documents manually.

Please wait until your documents are verified. You will receive another email once your account has been approved.

Thank you for your patience.

Tool Sharing Platform Team`;

  await this.sendMail(
    email,
    subject,
    text,
  );
}

async sendModeratorApprovedEmail(
  email: string,
  fullName: string,
): Promise<void> {

  const subject = 'Moderator Account Approved';

  const text = `Hello ${fullName},

Congratulations!

Your submitted documents have been reviewed and approved successfully.

Your moderator account is now active.

You can now log in to the Tool Sharing Platform and start using all moderator features.

Thank you for your patience.

Best Regards,
Tool Sharing Platform Team`;

  await this.sendMail(
    email,
    subject,
    text,
  );
}

async sendModeratorRejectedEmail(
  email: string,
  fullName: string,
): Promise<void> {

  const subject = 'Moderator Document Verification Failed';

  const text = `Hello ${fullName},

We regret to inform you that your submitted documents could not be verified.

Please review your information and upload valid documents again.

If you believe this is a mistake, please contact our support team.

Thank you.

Best Regards,
Tool Sharing Platform Team`;

  await this.sendMail(
    email,
    subject,
    text,
  );
}
async sendPasswordResetOtp(
  email: string,
  otp: string,
): Promise<void> {

  const subject = 'Password Reset Request';

  const text = `Hello,

We received a request to reset your password.

Your Password Reset OTP is: ${otp}

This OTP will expire in 10 minutes.

If you did not request a password reset, you can safely ignore this email.

Thank you.

Tool Sharing Platform Team`;

  await this.sendMail(
    email,
    subject,
    text,
  );
}
}