import { Column, CreateDateColumn,
     Entity, 
      PrimaryGeneratedColumn,  
      UpdateDateColumn, 
        OneToOne,
        JoinColumn
     } from "typeorm";
import { DocumentStatus } from "../enums/document-status.enum";
import { Moderator } from "./moderator.entity";


@Entity("Moderator_Document")
export class ModeratorDocument      
{
@PrimaryGeneratedColumn()
  documentId!: number;


  @Column({
    type: 'varchar',
    length: 30,
    unique: true,
  })
  nidNumber!: string;

  @Column({
    type: 'text',
  })
  nidFrontImage!: string;

  @Column({
    type: 'text',
  })
  nidBackImage!: string;

  @Column({
    type: 'enum',
    enum: DocumentStatus,
    default: DocumentStatus.PENDING,
  })
  status!: DocumentStatus;

  @Column({
    nullable: true,
  })
  verifiedBy!: number;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  verifiedAt!: Date;

  @Column({
    type: 'text',
    nullable: true,
  })
  remarks!: string;

  @CreateDateColumn()
  createdAt!: Date;

  

  @UpdateDateColumn()
  updatedAt!: Date;

    @OneToOne(()=> Moderator, (moderator)=>moderator.document)
    @JoinColumn(
        {
            name : "moderatorId",
        }
    )
    moderator!: Moderator;
        
    

}
