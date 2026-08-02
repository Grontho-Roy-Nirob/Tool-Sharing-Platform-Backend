import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AdminAuthController } from './admin.auth.controller';
import { AdminAuthService } from './admin.auth.service';
import { Admin } from '../entity/admin.entity';
import { jwtConstants } from './admin.constants';

@Module({
  imports: [
    TypeOrmModule.forFeature([Admin]),
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { 
        expiresIn: (jwtConstants.expiresIn || '1d') as any 
      },
    }),
  ],
  controllers: [AdminAuthController],
  providers: [AdminAuthService],
  exports: [AdminAuthService],
})
export class AdminAuthModule {}