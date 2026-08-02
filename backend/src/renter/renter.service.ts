import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRenterDto, UpdateRenterDto } from './dto/renter.dto';
import { Renter } from './entity/renter.entity';

@Injectable()
export class RenterService {
  constructor(
    @InjectRepository(Renter)
    private readonly renterRepository: Repository<Renter>,
  ) {}

  // Create a new renter
  async create(createRenterDto: CreateRenterDto): Promise<Renter> {
    const renter = this.renterRepository.create(createRenterDto);
    return await this.renterRepository.save(renter);
  }

  // Get all renters
  async findAll(): Promise<Renter[]> {
    return await this.renterRepository.find();
  }

  // Get renter by ID
  async findOne(id: number): Promise<Renter | null> {
    return await this.renterRepository.findOne({
      where: { renterId: id },
    });
  }

  // Get renter by email (used later for login)
  async findByEmail(email: string): Promise<Renter | null> {
    return await this.renterRepository.findOne({
      where: { email },
    });
  }

  // Update renter
  async update(
    id: number,
    updateRenterDto: UpdateRenterDto,
  ): Promise<Renter | null> {
    await this.renterRepository.update(id, updateRenterDto);
    return this.findOne(id);
  }

  // Delete renter
  async remove(id: number): Promise<void> {
    await this.renterRepository.delete(id);
  }
}
