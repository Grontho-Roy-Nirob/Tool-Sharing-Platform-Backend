import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { OwnerEntity } from 'src/owner/entity/owner.entity';
import { CategoryEntity } from './category.entity';

@Entity('tool')
export class ToolEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'character varying', length: 150 })
  tool_name!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'character varying', length: 100 })
  brand!: string;

  @Column({ type: 'character varying', length: 100 })
  condition!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  rental_price_per_day!: number;

  @Column({ type: 'character varying', length: 255 })
  location!: string;

  @Column({ default: true })
  is_available!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at!: Date;

  @Column({ type: 'character varying', default: 'pending' })
  status!: string;

  @Column({ nullable: true })
  reviewed_by!: string;

  @Column({ type: 'text', nullable: true })
  rejection_reason!: string;

  @Column()
  tool_image!: string;

  // Relationship with Category
  @ManyToOne(() => CategoryEntity, (category) => category.tools)
  category!: CategoryEntity;

  // Relationship with Owner
  @ManyToOne(() => OwnerEntity, (owner) => owner.tools)
  owner!: OwnerEntity;
}
