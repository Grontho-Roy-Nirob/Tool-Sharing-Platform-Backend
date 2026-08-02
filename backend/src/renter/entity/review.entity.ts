import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Renter } from './renter.entity';

@Entity('review')
export class Review {
  @PrimaryGeneratedColumn({
    name: 'review_id',
  })
  reviewId: number;

  // Will become a relation to OrderEntity later
  @Column({
    name: 'order_id',
    type: 'int',
  })
  orderId: number;

  @ManyToOne(() => Renter, (renter) => renter.reviews, {
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'renter_id',
  })
  renter: Renter;

  @Column({
    type: 'int',
  })
  rating: number;

  @Column({
    type: 'text',
    nullable: true,
  })
  review?: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
  })
  updatedAt: Date;
}
