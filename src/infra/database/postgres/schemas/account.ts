import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToOne,
  Relation,
  UpdateDateColumn
} from 'typeorm';

import { RoleSchema } from './role';
import { UserPasswordSchema } from './user-password';

@Entity({ name: 'accounts' })
export class AccountSchema extends BaseEntity {
  @Column({ type: 'uuid', primary: true })
  id!: string;

  @Column('text', { unique: true })
  email!: string;

  @Column('text', { unique: true })
  username!: string;

  @Column('boolean', { default: true })
  isActive!: boolean;

  @OneToOne(() => UserPasswordSchema, { cascade: ['insert', 'recover', 'update', 'remove', 'soft-remove'] })
  @JoinColumn()
  password!: Relation<UserPasswordSchema>;

  @ManyToMany(() => RoleSchema, { eager: true, cascade: ['recover'] })
  @JoinTable({ name: 'accounts_roles' })
  roles!: Relation<RoleSchema[]>;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt!: Date;
}
