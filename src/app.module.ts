import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR, Reflector } from '@nestjs/core';

import { InfraModule } from '@/infra/module';
import { AuthorizationRoleGuard } from '@/middlewares/guards';

import { IUserRepository } from './core/user/repository/user';
import { ILoggerAdapter, LoggerModule } from './infra/logger';
import { LibModule } from './libs/module';
import {
  ExceptionHandlerInterceptor,
  HttpLoggerInterceptor,
  MetricsInterceptor,
  RequestTimeoutInterceptor,
  TracingInterceptor
} from './middlewares/interceptors';
import { AccountModule } from './modules/account/module';
import { AlertModule } from './modules/alert/module';
import { CatModule } from './modules/cat/module';
import { HealthModule } from './modules/health/module';
import { LoginModule } from './modules/login/module';
import { LogoutModule } from './modules/logout/module';
import { PermissionModule } from './modules/permission/module';
import { ResetPasswordModule } from './modules/reset-password/module';
import { RoleModule } from './modules/role/module';
import { UserModule } from './modules/user/module';

@Module({
  imports: [
    InfraModule,
    LibModule,
    HealthModule,
    AlertModule,
    AccountModule,
    UserModule,
    LoginModule,
    LogoutModule,
    CatModule,
    ResetPasswordModule,
    RoleModule,
    PermissionModule,
    LoggerModule
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useFactory: (logger: ILoggerAdapter) => new RequestTimeoutInterceptor(new Reflector(), logger),
      inject: [ILoggerAdapter]
    },
    {
      provide: APP_INTERCEPTOR,
      useFactory: () => new ExceptionHandlerInterceptor()
    },
    {
      provide: APP_INTERCEPTOR,
      useFactory: (logger: ILoggerAdapter) => new HttpLoggerInterceptor(logger),
      inject: [ILoggerAdapter]
    },
    {
      provide: APP_INTERCEPTOR,
      useFactory: (logger: ILoggerAdapter) => new TracingInterceptor(logger),
      inject: [ILoggerAdapter]
    },
    {
      provide: APP_INTERCEPTOR,
      useFactory: () => new MetricsInterceptor()
    },
    {
      provide: APP_GUARD,
      useFactory: (repository: IUserRepository) => new AuthorizationRoleGuard(new Reflector(), repository),
      inject: [IUserRepository]
    }
  ]
})
export class AppModule {}
