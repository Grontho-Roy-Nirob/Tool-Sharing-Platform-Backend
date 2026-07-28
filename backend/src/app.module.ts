import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OwnerModule } from './owner/owner.module';

@Module({
  imports: [TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'root',
      database: 'ToolSharingDB', //Change to your database name
      autoLoadEntities: true,
      synchronize: true,
    }),OwnerModule,],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
