import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
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

  @ManyToMany(() => ToolEntity, (tool) => tool.orders)
  @JoinTable({
    name: 'order_tools',

    joinColumn: {
      name: 'order_id',
      referencedColumnName: 'id',
    },

    inverseJoinColumn: {
      name: 'tool_id',
      referencedColumnName: 'id',
    },
  })
  tools!: ToolEntity[];

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

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    name: 'total_amount',
  })
  total_amount!: number;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status!: OrderStatus;

  @Column({
    type: 'text',
    nullable: true,
  })
  message!: string | null;

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
