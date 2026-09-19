// import { Module } from '@nestjs/common';

// import { AppController } from './app.controller';
// import { AppService } from './app.service';

// import { TypeOrmModule } from '@nestjs/typeorm';

// import { OwnerModule } from './owner/owner.module';
// import { OwnerAuthModule } from './owner/auth/owner.auth.module';

// import { AdminModule } from './admin/admin.module';
// import { AdminAuthModule } from './admin/auth/admin.auth.module';

// import { ConfigModule } from '@nestjs/config';

// import { RenterModule } from './renter/renter.module';
// import { RenterAuthModule } from './renter/auth/renter.auth.module';

// import { ReviewModule } from './renter/review.module';
// import { PaymentModule } from './renter/payment.modulle';

// import { ServeStaticModule } from '@nestjs/serve-static';
// import { join } from 'path';
// import { ToolModule } from './owner/tool.module';

// @Module({
//   imports: [
//     ConfigModule.forRoot({
//       isGlobal: true,
//     }),

//     TypeOrmModule.forRoot({
//       type: 'postgres',
//       host: 'localhost',
//       port: 5432,
//       username: 'postgres',
//       password: process.env.DB_PASSWORD,
//       database: 'ToolSharingDB',
//       autoLoadEntities: true,
//       synchronize: true,
//     }),

//     // Serve uploaded files
//     ServeStaticModule.forRoot({
//       rootPath: join(__dirname, '..', 'uploads'),
//       serveRoot: '/uploads',
//     }),

//     OwnerModule,
//     OwnerAuthModule,
//     AdminModule,
//     AdminAuthModule,
//     RenterModule,
//     RenterAuthModule,
//     ReviewModule,
//     PaymentModule,
//     ToolModule,
//   ],

//   controllers: [AppController],
//   providers: [AppService],
// })
// export class AppModule {}

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OwnerModule } from './owner/owner.module';
import { OwnerAuthModule } from './owner/auth/owner.auth.module';
import { AdminModule } from './admin/admin.module';
import { AdminAuthModule } from './admin/auth/admin.auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RenterModule } from './renter/renter.module';
import { RenterAuthModule } from './renter/auth/renter.auth.module';
import { ReviewModule } from './renter/review.module';
import { PaymentModule } from './renter/payment.modulle';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { ToolModule } from './owner/tool.module';

@Module({
  imports: [
    // Load .env file
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Supabase PostgreSQL Database
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],

      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('ONLINE_DB_URL'),
        autoLoadEntities: true,
        synchronize: true,
        ssl: {
          rejectUnauthorized: false,
        },
      }),
    }),

    // Serve uploaded files
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),

    OwnerModule,
    OwnerAuthModule,
    AdminModule,
    AdminAuthModule,
    RenterModule,
    RenterAuthModule,
    ReviewModule,
    PaymentModule,
    ToolModule,
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
