import { IRepository } from '@/infra/repository';

import { AccountEntity } from '../entity/account';

export abstract class IAccountRepository extends IRepository<AccountEntity> {
  abstract existsOnUpdate(
    equalFilter: Pick<AccountEntity, 'email' | 'username'>,
    notEqualFilter: Pick<AccountEntity, 'id'>
  ): Promise<boolean>;
  abstract findByEmail(email: string): Promise<AccountEntity | null>;
  abstract findByUsername(username: string): Promise<AccountEntity | null>;
  abstract softRemove(entity: Partial<AccountEntity>): Promise<AccountEntity>;
  abstract findOneWithRelation(
    filter: Partial<AccountEntity>,
    relations: { [key in keyof Partial<AccountEntity>]: true | false }
  ): Promise<AccountEntity>;
}
