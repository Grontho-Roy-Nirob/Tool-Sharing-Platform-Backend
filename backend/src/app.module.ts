import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OwnerModule } from './owner/owner.module';
import { OwnerAuthModule } from './owner/auth/owner.auth.module';
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
      password: process.env.DB_PASSWORD,
      database: 'ToolSharingDB',
      autoLoadEntities: true,
      synchronize: true,
    }),
    OwnerModule,
    OwnerAuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
