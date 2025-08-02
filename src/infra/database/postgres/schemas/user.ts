import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  Relation,
  UpdateDateColumn
} from 'typeorm';

import { AccountSchema } from './account';

@Entity({ name: 'users' })
export class UserSchema extends BaseEntity {
  @Column({ type: 'uuid', primary: true })
  id!: string;

  @Column({ type: 'uuid' })
  accountId!: string;

  @Column('text')
  fullName!: string;

  @Column('date', { nullable: true })
  dateOfBirth?: Date;

  @Column('enum', { enum: ['male', 'female', 'other'], nullable: true })
  gender?: 'male' | 'female' | 'other';

  @Column('text', { nullable: true })
  avatar?: string;

  @Column('text', { nullable: true })
  phone?: string;

  @OneToOne(() => AccountSchema, { eager: true })
  @JoinColumn({ name: 'accountId' })
  account!: Relation<AccountSchema>;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt!: Date;
}
