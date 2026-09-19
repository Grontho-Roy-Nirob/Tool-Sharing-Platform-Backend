import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { OrderList } from './orderlist.entity';

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

@Entity('payment')
export class Payment {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    name: 'order_id',
    unique: true,
  })
  order_id!: number;

  @OneToOne(() => OrderList, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'order_id',
  })
  order!: OrderList;

  @Column({
    name: 'transaction_id',
    type: 'varchar',
    length: 255,
    unique: true,
  })
  transaction_id!: string;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
  })
  amount!: number;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status!: PaymentStatus;

  @Column({
    name: 'paid_at',
    type: 'timestamptz',
    nullable: true,
  })
  paid_at!: Date | null;

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
