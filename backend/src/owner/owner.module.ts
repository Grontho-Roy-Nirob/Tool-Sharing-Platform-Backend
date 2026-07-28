import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OwnerController } from './owner.controller';
import { OwnerEntity } from './entity/owner.entity';
import { OwnerService } from './owner.service';

@Module({
  imports: [TypeOrmModule.forFeature([OwnerEntity]),],
  controllers: [OwnerController],
  providers: [OwnerService],
  exports: [OwnerService],
})
export class OwnerModule {}