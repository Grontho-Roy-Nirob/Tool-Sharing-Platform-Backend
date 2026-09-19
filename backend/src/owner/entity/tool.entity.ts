import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { OwnerEntity } from 'src/owner/entity/owner.entity';
import { CategoryEntity } from './category.entity';
import { OrderList } from 'src/renter/entity/orderlist.entity';
import { Review } from 'src/renter/entity/review.entity';

export enum ToolStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

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

    @Column({
    type: 'enum',
    enum: ToolStatus,
    default: ToolStatus.PENDING,
  })
  status!: ToolStatus;

  @Column()
  tool_image!: string;

  // Relationship with Category

  // @ManyToOne(() => CategoryEntity, (category) => category.tools)
  // category!: CategoryEntity;

  //change mahib made
  @Column({ name: 'category_id' })
  category_id!: number;

  @ManyToOne(() => CategoryEntity, (category) => category.tools, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'category_id' })
  category!: CategoryEntity;

  @ManyToMany(() => OrderList, (order) => order.tools)
  orders!: OrderList[];

  // Relationship with Owner
  @ManyToOne(() => OwnerEntity, (owner) => owner.tools)
  owner!: OwnerEntity;
  //review
  @OneToMany(() => Review, (review) => review.tool)
  reviews!: Review[];
}
