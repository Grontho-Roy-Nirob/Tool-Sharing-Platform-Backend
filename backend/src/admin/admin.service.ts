import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Admin } from './entity/admin.entity';
import { LoginAdminDto } from './dto/admin.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin)
    private readonly adminRepo: Repository<Admin>,
  ) {}

  // Get all admins
  async getAllAdmin(): Promise<Admin[]> {
    return this.adminRepo.find();
  }

  // Find admin by email
  async findOne(loginData: LoginAdminDto): Promise<Admin | null> {
    return this.adminRepo.findOne({
      where: {
        email: loginData.email,
      },
    });
  }
}
