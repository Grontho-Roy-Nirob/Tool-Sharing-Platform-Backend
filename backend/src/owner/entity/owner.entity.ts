import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ToolEntity } from './tool.entity';

@Entity('owner')
export class OwnerEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type: 'character varying',
    length: 150,
  })
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column({ unique: true })
  phone!: string;

  @Column()
  profile_image!: string;

  @Column({
    type: 'character varying',
    default: 'owner',
  })
  role!: string;

  @CreateDateColumn({
    name: 'created_at',
  })
  created_at!: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updated_at!: Date;

  @OneToMany(() => ToolEntity, (tool) => tool.owner, {cascade: true,})
  tools: ToolEntity[] | undefined;
}