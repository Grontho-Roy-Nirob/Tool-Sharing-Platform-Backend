import { Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { CreateDateColumn } from "typeorm/browser";
import { ModeratorStatus } from "../enums/moderator-status.enum";

import { ModeratorDocument } from "./moderator-document.entity";
import { ModeratorEmailVerification } from "./moderator-email-verification.entity";
import { ModeratorPasswordReset } from "./moderator-password-reset.entity";
import { UserStatus } from "../enums/user-status.enum";
@Entity("Moderator")
export class Moderator 
{
   @PrimaryGeneratedColumn()
   moderatorId!: number;

   @Column(
    {
        type : 'varchar',
        length : 100,

    }
   )
   fullName!: string;

   @Column(
    {
        type : 'varchar',
        length : 100,
        unique: true,

    }
   )
   email!: string;

   @Column(
    {
        type :"varchar",
        length   : 100,
    }
   )
   password!: string;

   @Column(
    {
        type : "varchar",
        length : 100,
    }
   )
   phoneNumber!: string;

   @Column
   (
    {
        type : "varchar",
        nullable : true,
    }
 
)
profileImage!:string;

@Column(
    {
        type : 'enum',
        enum : ModeratorStatus,
        default : ModeratorStatus.PENDING
    }
)
status!: ModeratorStatus;
@CreateDateColumn()
createdAt!: Date;

@UpdateDateColumn()
updatedAt!: Date;
@Column(
    {
        type : "boolean",
        default : false,
    }
)
emailVerified!: boolean;
@Column(
    {
        type :'enum',
        enum : UserStatus,
        default : UserStatus.INACTIVE,
    }
)
userStatus!: UserStatus;
    


//realtionship 
@OneToOne(()=> ModeratorDocument, (document)=>document.moderator)
document!: ModeratorDocument;


@OneToMany(
    ()=>ModeratorEmailVerification,
    (emailVerification)=>emailVerification.moderator,
)
emailVerifications!: ModeratorEmailVerification[];


@OneToMany(
    ()=>ModeratorPasswordReset,
    (passwordReset)=>passwordReset.moderator,
)
passwordResets!: ModeratorPasswordReset[];

}