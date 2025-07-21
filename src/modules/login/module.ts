import { Module } from '@nestjs/common';

import { IUserRepository } from '@/core/user/repository/user';
import { LoginUsecase } from '@/core/user/use-cases/user-login';
import { RefreshTokenUsecase } from '@/core/user/use-cases/user-refresh-token';
import { HttpModule } from '@/infra/http';
import { SecretsModule } from '@/infra/secrets';
import { ITokenAdapter, TokenLibModule } from '@/libs/token';

import { UserModule } from '../user/module';
import { ILoginAdapter, IRefreshTokenAdapter } from './adapter';
import { LoginController } from './controller';
import { GoogleAuthService } from './google-auth.service';

@Module({
  imports: [TokenLibModule, UserModule, SecretsModule, HttpModule],
  controllers: [LoginController],
  providers: [
    {
      provide: ILoginAdapter,
      useFactory: (repository: IUserRepository, tokenService: ITokenAdapter) => {
        return new LoginUsecase(repository, tokenService);
      },
      inject: [IUserRepository, ITokenAdapter]
    },
    {
      provide: IRefreshTokenAdapter,
      useFactory: (repository: IUserRepository, tokenService: ITokenAdapter) => {
        return new RefreshTokenUsecase(repository, tokenService);
      },
      inject: [IUserRepository, ITokenAdapter]
    },
    GoogleAuthService
  ]
})
export class LoginModule {}
