import { Injectable } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Admin } from './entity/admin.entity';

import { LoginAdminDto } from './dto/admin.dto';



@Injectable()

export class AdminService {

  constructor(

    @InjectRepository(Admin) private adminRepo: Repository<Admin>,

  ) {}



  getAllAdmin(): Promise<Admin[]> {

    return this.adminRepo.find();

  }



  async findOne(logindata: LoginAdminDto): Promise<Admin | null> {

    return await this.adminRepo.findOneBy({ email: logindata.email });

  }

} 

