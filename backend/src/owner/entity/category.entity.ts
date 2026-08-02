import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ToolEntity } from './tool.entity';

@Entity('category')
export class CategoryEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type: 'character varying',
    length: 150,
  })
  name!: string;

  @CreateDateColumn({
    name: 'created_at',
  })
  created_at!: Date;


  @OneToMany(() => ToolEntity, (tool) => tool.category, {cascade: true})
  tools: ToolEntity[] | undefined;
}