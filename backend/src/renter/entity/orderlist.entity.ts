import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Renter } from './renter.entity';
import { ToolEntity } from '../../owner/entity/tool.entity';

export enum OrderStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  ACTIVE = 'active',
  COMPLETED = 'completed',
}

@Entity('order_list')
export class OrderList {
  @PrimaryGeneratedColumn()
  id!: number;

  // ==========================================
  // RENTER
  // ==========================================

  @Column({
    name: 'renter_id',
  })
  renter_id!: number;

  @ManyToOne(() => Renter, (renter) => renter.orders, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'renter_id',
    referencedColumnName: 'renterId',
  })
  renter!: Renter;

  // ==========================================
  // TOOL
  // ==========================================

  @Column({
    name: 'tool_id',
  })
  tool_id!: number;

  @ManyToOne(() => ToolEntity, (tool) => tool.orders, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'tool_id',
    referencedColumnName: 'id',
  })
  tool!: ToolEntity;

  // ==========================================
  // RENTAL PERIOD
  // ==========================================

  @Column({
    type: 'date',
    name: 'start_date',
  })
  start_date!: Date;

  @Column({
    type: 'date',
    name: 'end_date',
  })
  end_date!: Date;

  @Column({
    type: 'int',
    name: 'duration_days',
  })
  duration_days!: number;

  // ==========================================
  // PRICE
  // ==========================================

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    name: 'rental_price_per_day',
  })
  rental_price_per_day!: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    name: 'total_amount',
  })
  total_amount!: number;

  // ==========================================
  // ORDER STATUS
  // ==========================================

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status!: OrderStatus;

  // ==========================================
  // RENTER MESSAGE
  // ==========================================

  @Column({
    type: 'text',
    nullable: true,
  })
  message!: string | null;

  // ==========================================
  // TIMESTAMPS
  // ==========================================

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  created_at!: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
  })
  updated_at!: Date;
}
