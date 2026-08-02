import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OwnerEntity } from './entity/owner.entity';
import { loginDTO, OwnerDTO } from './dto/owner.dto';
import { CategoryEntity } from './entity/category.entity';
import { ToolEntity } from './entity/tool.entity';
import { ToolDTO } from './dto/tool.dto';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class OwnerService {
  constructor(
    @InjectRepository(OwnerEntity) private ownerRepo: Repository<OwnerEntity>,
    @InjectRepository(CategoryEntity)
    private categoryRepo: Repository<CategoryEntity>,
    @InjectRepository(ToolEntity) private toolRepo: Repository<ToolEntity>,
    private readonly mailerService: MailerService,
  ) {}

  //getAllOwner
  getAllOwner(): Promise<OwnerEntity[]> {
    return this.ownerRepo.find();
  }

  //Register Owner
  async createOwner(data: OwnerDTO): Promise<OwnerEntity> {
    const owner = await this.ownerRepo.save(data);

    await this.mailerService.sendMail({
      to: owner.email,
      subject: 'Welcome to Tool Sharing Platform',

      text: `Hello ${owner.name},Welcome to Tool Sharing Platform.Your account has been created 
      successfully.Thank you.`,
    });

    return owner;
  }

  //Login
  async findOne(logindata: loginDTO): Promise<OwnerEntity | null> {
    return await this.ownerRepo.findOneBy({ email: logindata.email });
  }

  //getCategoryName
  async getCategoryName() {
    return await this.categoryRepo.find({
      select: {
        name: true,
      },
    });
  }

  //getAllTool
  getAllTools(): Promise<ToolEntity[]> {
    return this.toolRepo.find();
  }

  //create tool
  async createTool(ownerid: number, tooldata: ToolDTO): Promise<ToolEntity> {
    const owner = await this.ownerRepo.findOneBy({ id: ownerid });
    if (!owner) {
      throw new Error('Owner not found');
    }
    const category = await this.categoryRepo.findOneBy({
      id: tooldata.category_id,
    });
    if (!category) {
      throw new Error('Category not found');
    }
    return await this.toolRepo.save({
      ...tooldata,
      owner,
      category,
    });
  }

  //update tool
  async updateTool(id: number, tooldata: ToolDTO): Promise<ToolEntity> {
    const tool = await this.toolRepo.findOneBy({ id });
    if (!tool) {
      throw new Error('Tool not found');
    }

    let category = tool.category;
    if (tooldata.category_id) {
      const newCategory = await this.categoryRepo.findOneBy({
        id: tooldata.category_id,
      });

      if (!newCategory) {
        throw new Error('Category not found');
      }
      category = newCategory;
    }
    return await this.toolRepo.save({
      ...tool,
      ...tooldata,
      category,
    });
  }

  // Update Owner
  async updateOwner(
    id: number,
    ownerData: OwnerDTO,
  ): Promise<OwnerEntity | null> {
    await this.ownerRepo.update(id, ownerData);
    return await this.ownerRepo.findOneBy({ id });
  }

  //Delete Owner
  async deleteOwner(ownerid: number): Promise<void> {
    await this.ownerRepo.delete(ownerid);
  }
}
