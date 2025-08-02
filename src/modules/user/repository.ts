import { Injectable } from '@nestjs/common';
import { FindOptionsOrder, FindOptionsRelations, FindOptionsWhere, Not, Repository } from 'typeorm';

import { UserEntity } from '@/core/user/entity/user';
import { IUserRepository } from '@/core/user/repository/user';
import { UserListInput, UserListOutput } from '@/core/user/use-cases/user-list';
import { UserSchema } from '@/infra/database/postgres/schemas/user';
import { TypeORMRepository } from '@/infra/repository/postgres/repository';
import { ConvertTypeOrmFilter, SearchTypeEnum, ValidateDatabaseSortAllowed } from '@/utils/decorators';
import { IEntity } from '@/utils/entity';
import { PaginationUtils } from '@/utils/pagination';

@Injectable()
export class UserRepository extends TypeORMRepository<Model> implements IUserRepository {
  constructor(readonly repository: Repository<Model>) {
    super(repository);
  }

  async existsOnUpdate(
    equalFilter: Pick<UserEntity, 'accountId'>,
    notEqualFilter: Pick<UserEntity, 'id'>
  ): Promise<boolean> {
    const exists = await this.repository.exists({
      where: { id: Not(notEqualFilter.id), accountId: equalFilter.accountId }
    });

    return exists;
  }

  async findOneWithRelation(
    filter: Partial<UserEntity>,
    relations: { [key in keyof Partial<UserEntity>]: boolean }
  ): Promise<UserEntity> {
    return (await this.repository.findOne({
      where: filter as FindOptionsWhere<unknown>,
      relations: relations as FindOptionsRelations<unknown>
    })) as UserEntity;
  }

  async findByAccountEmail(email: string): Promise<UserEntity> {
    return (await this.repository.findOne({
      where: { account: { email } },
      relations: { account: true }
    })) as UserEntity;
  }

  async softRemove(entity: Partial<UserEntity>): Promise<Model> {
    return await this.repository.softRemove(entity as Model);
  }

  @ConvertTypeOrmFilter<UserEntity>([
    { name: 'fullName', type: SearchTypeEnum.like },
    { name: 'phone', type: SearchTypeEnum.equal }
  ])
  @ValidateDatabaseSortAllowed<UserEntity>({ name: 'fullName' }, { name: 'createdAt' })
  async paginate(input: UserListInput): Promise<UserListOutput> {
    const skip = PaginationUtils.calculateSkip(input);

    const [docs, total] = await this.repository.findAndCount({
      take: input.limit,
      skip,
      order: input.sort as FindOptionsOrder<IEntity>,
      where: input.search as FindOptionsWhere<IEntity>
    });

    return { docs, total, page: input.page, limit: input.limit };
  }
}

type Model = UserSchema & UserEntity;
