import { Injectable } from '@nestjs/common';
import { FindOptionsRelations, FindOptionsWhere, Not, Repository } from 'typeorm';

import { AccountEntity } from '@/core/account/entity/account';
import { IAccountRepository } from '@/core/account/repository/account';
import { AccountSchema } from '@/infra/database/postgres/schemas/account';
import { TypeORMRepository } from '@/infra/repository/postgres/repository';

@Injectable()
export class AccountRepository extends TypeORMRepository<Model> implements IAccountRepository {
  constructor(readonly repository: Repository<Model>) {
    super(repository);
  }

  async existsOnUpdate(
    equalFilter: Pick<AccountEntity, 'email' | 'username'>,
    notEqualFilter: Pick<AccountEntity, 'id'>
  ): Promise<boolean> {
    const exists = await this.repository.exists({
      where: {
        id: Not(notEqualFilter.id),
        email: equalFilter.email
      }
    });

    if (!exists && equalFilter.username) {
      return await this.repository.exists({
        where: {
          id: Not(notEqualFilter.id),
          username: equalFilter.username
        }
      });
    }

    return exists;
  }

  async findByEmail(email: string): Promise<AccountEntity | null> {
    return (await this.repository.findOne({
      where: { email }
    })) as AccountEntity | null;
  }

  async findByUsername(username: string): Promise<AccountEntity | null> {
    return (await this.repository.findOne({
      where: { username }
    })) as AccountEntity | null;
  }

  async findOneWithRelation(
    filter: Partial<AccountEntity>,
    relations: { [key in keyof Partial<AccountEntity>]: boolean }
  ): Promise<AccountEntity> {
    return (await this.repository.findOne({
      where: filter as FindOptionsWhere<unknown>,
      relations: relations as FindOptionsRelations<unknown>
    })) as AccountEntity;
  }

  async softRemove(entity: Partial<AccountEntity>): Promise<Model> {
    return await this.repository.softRemove(entity as Model);
  }
}

type Model = AccountSchema & AccountEntity;
