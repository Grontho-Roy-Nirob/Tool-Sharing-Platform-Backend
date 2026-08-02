import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Moderator } from './moderator.entity';
@Entity('moderator_email_verification')
export class ModeratorEmailVerification {
  @PrimaryGeneratedColumn()
  verificationId!: number;

  @Column()
  moderatorId!: number;

  @Column({
    type: 'varchar',
    length: 6,
  })
  otp!: string;

  @Column({
    type: 'timestamp',
  })
  expiresAt!: Date;

  @Column({
    default: false,
  })
  isUsed!: boolean;

  @CreateDateColumn()
  createdAt!: Date;


  //relationship 

  @ManyToOne(
    ()=>Moderator,
    (moderator)=>moderator.emailVerifications,
    {
        onDelete : "CASCADE",
    },
)
@JoinColumn(
    {
        name : "moderatorId",
    }
)
moderator!: Moderator;
   
}