import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('admin')
export class Admin {
  @PrimaryGeneratedColumn()
  admin_id?: number;

  @Column({ type: 'varchar', length: 150 })
  full_name?: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email?: string;

  @Column({ type: 'varchar', length: 255 })
  password?: string;

  @Column({ type: 'varchar', length: 20, unique: true, nullable: true })
  phone?: string;

  @Column({ type: 'text', nullable: true })
  profile_image?: string;

  @Column({ type: 'int', default: 1 })
  role?: number;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at?: Date;

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updated_at?: Date;
}