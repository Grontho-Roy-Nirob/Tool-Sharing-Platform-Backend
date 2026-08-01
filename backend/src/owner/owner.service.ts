import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OwnerEntity } from './entity/owner.entity';
import { loginDTO, OwnerDTO } from './dto/owner.dto';
import { CategoryEntity } from './entity/category.entity';

@Injectable()
export class OwnerService {
  constructor(
    @InjectRepository(OwnerEntity) private ownerRepo: Repository<OwnerEntity>,
    @InjectRepository(CategoryEntity) private categoryRepo: Repository<CategoryEntity>,
  ) {}

  getAllOwner(): Promise<OwnerEntity[]> {
    return this.ownerRepo.find();
  }
  
  async createOwner(data: OwnerDTO): Promise<OwnerEntity> {
    return await this.ownerRepo.save(data);
  }

  async findOne(logindata: loginDTO): Promise<OwnerEntity | null> {
    return await this.ownerRepo.findOneBy({ email: logindata.email });
  }

  
}
