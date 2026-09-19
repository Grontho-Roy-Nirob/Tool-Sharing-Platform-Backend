import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { Admin } from '../entity/admin.entity';
import { LoginAdminDto, CreateAdminDto } from '../dto/admin.dto';

@Injectable()
export class AdminAuthService {
  constructor(
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,

    private readonly jwtService: JwtService,
  ) {}

  // ==========================================
  // ADMIN LOGIN
  // ==========================================

  async login(loginAdminDto: LoginAdminDto) {
    const { email, password } = loginAdminDto;

    // Find admin by email
    const admin = await this.adminRepository.findOne({
      where: { email },
    });

    // Admin not found
    if (!admin || !admin.password) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Verify password using bcrypt
    const isPasswordValid = await bcrypt.compare(
      String(password),
      admin.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // JWT payload
    const payload = {
      sub: admin.admin_id,
      email: admin.email,
      role: admin.role,
    };

    // Secret and expiration are configured
    // inside AdminAuthModule
    const token = await this.jwtService.signAsync(payload);

    return {
      message: 'Login successful',

      access_token: token,

      admin: {
        id: admin.admin_id,
        full_name: admin.full_name,
        email: admin.email,
        role: admin.role,
      },
    };
  }

  // ==========================================
  // TEMPORARY ADMIN CREATION
  // TODO: REMOVE AFTER CREATING INITIAL ADMIN
  // ==========================================

  async createAdmin(createAdminDto: CreateAdminDto) {
    const { full_name, email, password, phone, profile_image, role } =
      createAdminDto;

    // Check duplicate email
    const existingAdmin = await this.adminRepository.findOne({
      where: { email },
    });

    if (existingAdmin) {
      throw new ConflictException('Admin with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin entity
    const admin = this.adminRepository.create({
      full_name,
      email,
      password: hashedPassword,
      phone,
      profile_image,
      role: role ?? 1,
    });

    // Save admin
    const savedAdmin = await this.adminRepository.save(admin);

    // Never return the password
    return {
      message: 'Admin created successfully',

      admin: {
        id: savedAdmin.admin_id,
        full_name: savedAdmin.full_name,
        email: savedAdmin.email,
        phone: savedAdmin.phone,
        role: savedAdmin.role,
      },
    };
  }
}
