import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AccountEntity } from '@/core/account/entity/account';
import { IAccountRepository } from '@/core/account/repository/account';
import { RedisCacheModule } from '@/infra/cache/redis';
import { AccountSchema } from '@/infra/database/postgres/schemas/account';
import { LoggerModule } from '@/infra/logger';
import { SecretsModule } from '@/infra/secrets';
import { EventLibModule } from '@/libs/event';
import { TokenLibModule } from '@/libs/token';
import { AuthenticationMiddleware } from '@/middlewares/middlewares';

import { RoleModule } from '../role/module';
import { AccountController } from './controller';
import { AccountRepository } from './repository';

@Module({
  imports: [
    TokenLibModule,
    SecretsModule,
    LoggerModule,
    RedisCacheModule,
    EventLibModule,
    TypeOrmModule.forFeature([AccountSchema]),
    RoleModule
  ],
  controllers: [AccountController],
  providers: [
    {
      provide: IAccountRepository,
      useFactory: (repository: Repository<AccountSchema & AccountEntity>) => {
        return new AccountRepository(repository);
      },
      inject: [getRepositoryToken(AccountSchema)]
    }
  ],
  exports: [IAccountRepository]
})
export class AccountModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthenticationMiddleware).forRoutes(AccountController);
  }
}
