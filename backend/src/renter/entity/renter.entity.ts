import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  //OneToMany,
} from 'typeorm';
// import { OrderList } from '../../orderlist/entities/orderlist.entity';

export enum RenterRole {
  RENTER = 0,
}
import { OneToMany } from 'typeorm';
import { Review } from './review.entity';

@Entity('renter')
export class Renter {
  @PrimaryGeneratedColumn({ name: 'renter_id' })
  renterId: number;

  @Column({ name: 'full_name', length: 150 })
  fullName: string;

  @Column({ unique: true })
  email: string;

  @Column({
    select: false,
  })
  password: string;

  @Column({
    length: 20,
    unique: true,
    nullable: true,
  })
  phone?: string;

  @Column({
    name: 'profile_image',
    type: 'text',
    nullable: true,
  })
  profileImage?: string;

  @Column({
    name: 'nid_number',
    type: 'bigint',
  })
  nidNumber: string;

  @Column({
    type: 'int',
    default: RenterRole.RENTER,
  })
  role: RenterRole;

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

  // @ManyToOne(() => Renter, (renter) => renter.reviews)
  // @JoinColumn({
  //   name: 'renter_id',
  // })
  @OneToMany(() => Review, (review) => review.renter)
  reviews: Review[];
  renter: Renter;
}
