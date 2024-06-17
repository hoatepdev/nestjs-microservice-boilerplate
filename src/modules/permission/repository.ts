import { Injectable } from '@nestjs/common';
import { FindOptionsWhere, Repository } from 'typeorm';

import { PermissionEntity } from '@/core/permission/entity/permission';
import { IPermissionRepository } from '@/core/permission/repository/permission';
import { PermissionListInput, PermissionListOutput } from '@/core/permission/use-cases/permission-list';
import { PermissionSchema } from '@/infra/database/postgres/schemas/permission';
import { TypeORMRepository } from '@/infra/repository/postgres/repository';
import { SearchTypeEnum, ValidateDatabaseSortAllowed, ValidateMongooseFilter } from '@/utils/decorators';
import { calculateSkip } from '@/utils/pagination';

type Model = PermissionSchema & PermissionEntity;

@Injectable()
export class PermissionRepository extends TypeORMRepository<Model> implements IPermissionRepository {
  constructor(readonly repository: Repository<Model>) {
    super(repository);
  }

  @ValidateMongooseFilter<PermissionEntity>([{ name: 'name', type: SearchTypeEnum.like }])
  @ValidateDatabaseSortAllowed<PermissionEntity>('name', 'createdAt')
  async paginate(input: PermissionListInput): Promise<PermissionListOutput> {
    const skip = calculateSkip(input);

    const [docs, total] = await this.repository.findAndCount({
      take: input.limit,
      skip,
      order: input.sort,
      where: input.search as FindOptionsWhere<unknown>
    });

    return { docs, total, page: input.page, limit: input.limit };
  }
}
