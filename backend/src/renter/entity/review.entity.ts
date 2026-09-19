import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Renter } from '../entity/renter.entity';
import { ToolEntity } from '../../owner/entity/tool.entity';

@Entity('review')
export class Review {
  @PrimaryGeneratedColumn()
  review_id!: number;

  @Column({ type: 'int' })
  order_id!: number;

  @Column({ type: 'int' })
  rating!: number;

  @Column({ type: 'text', nullable: true })
  review!: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at!: Date;

  // Relationship with Tool
  @ManyToOne(() => ToolEntity, (tool) => tool.reviews, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'tool_id' })
  tool!: ToolEntity;

  // Relationship with Renter
  @ManyToOne(() => Renter, (renter) => renter.reviews, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'renter_id' })
  renter!: Renter;
}
