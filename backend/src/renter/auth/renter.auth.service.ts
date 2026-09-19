import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { Renter, RenterRole } from '../entity/renter.entity';
import { CreateRenterDto, LoginDto } from '../dto/renter.dto';

@Injectable()
export class RenterAuthService {
  constructor(
    @InjectRepository(Renter)
    private readonly renterRepository: Repository<Renter>,
    private readonly jwtService: JwtService,
  ) {}

  // Register
  async register(createRenterDto: CreateRenterDto): Promise<Renter> {
    const existingUser = await this.renterRepository.findOne({
      where: { email: createRenterDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists.');
    }

    const hashedPassword = await bcrypt.hash(createRenterDto.password, 10);

    const renter = this.renterRepository.create({
      ...createRenterDto,
      password: hashedPassword,
      role: RenterRole.RENTER,
    });

    return await this.renterRepository.save(renter);
  }

  // Login
  async login(loginDto: LoginDto): Promise<{ access_token: string }> {
    const renter = await this.renterRepository
      .createQueryBuilder('renter')
      .addSelect('renter.password')
      .where('renter.email = :email', {
        email: loginDto.email,
      })
      .getOne();

    if (!renter) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const isPasswordMatched = await bcrypt.compare(
      loginDto.password,
      renter.password,
    );

    if (!isPasswordMatched) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const payload = {
      sub: renter.renterId,
      email: renter.email,
      role: renter.role,
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
