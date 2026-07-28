import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OwnerEntity } from './entity/owner.entity';

@Injectable()
export class OwnerService {
  constructor(@InjectRepository(OwnerEntity) private ownerRepo: Repository<OwnerEntity>,) {

  }
}