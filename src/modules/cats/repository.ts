import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { CatsEntity } from '@/core/cats/entity/cats';
import { ICatsRepository } from '@/core/cats/repository/cats';
import { PostgresRepository } from '@/infra/repository/postgres/repository';

import { CatsSchema } from './schema';
import { CatsListInput, CatsListOutput } from './types';

@Injectable()
export class CatsRepository
  extends PostgresRepository<CatsSchema & CatsEntity>
  implements Omit<ICatsRepository, 'updateMany'>
{
  constructor(readonly repository: Repository<CatsSchema & CatsEntity>) {
    super(repository);
  }

  async paginate(input: CatsListInput): Promise<CatsListOutput> {
    const skip = (input.page - 1) * input.limit;
    const [docs, total] = await this.repository.findAndCount({ take: input.limit, skip });

    return { docs, total, page: input.page, limit: input.limit };
  }
}
