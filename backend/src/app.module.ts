import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OwnerModule } from './owner/owner.module';
import { OwnerAuthModule } from './owner/auth/owner.auth.module';
import { AdminModule } from './admin/admin.module';
import { AdminAuthModule } from './admin/auth/admin.auth.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'root',
      database: 'ToolSharingDB',
      autoLoadEntities: true,
      synchronize: true,
    }),
    OwnerModule,
    OwnerAuthModule,
    AdminModule,
    AdminAuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
