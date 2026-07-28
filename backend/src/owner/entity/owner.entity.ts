import { Column, Entity,PrimaryGeneratedColumn,CreateDateColumn,UpdateDateColumn} from 'typeorm';

@Entity('owner')
export class OwnerEntity {
  @PrimaryGeneratedColumn()
  owner_id!: number;

  @Column({ type: 'character varying', length: 150 })
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ nullable: false })
  password!: string;

  @Column({ unique: true })
  phone!: string;

  @Column()
  profile_image!: string;

  @Column({type: 'character varying', default: 'owner',
  })
  role!: string;

  @CreateDateColumn({name: 'created_at'})
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at', })
  updated_at!: Date;
}
