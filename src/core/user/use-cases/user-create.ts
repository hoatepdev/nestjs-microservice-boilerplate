import { AccountEntity, AccountEntitySchema } from '@/core/account/entity/account';
import { IAccountRepository } from '@/core/account/repository/account';
import { RoleEnum } from '@/core/role/entity/role';
import { IRoleRepository } from '@/core/role/repository/role';
import { SendEmailInput } from '@/infra/email';
import { ILoggerAdapter } from '@/infra/logger';
import { CreatedModel } from '@/infra/repository';
import { IEventAdapter } from '@/libs/event';
import { EventNameEnum } from '@/libs/event/types';
import { ValidateSchema } from '@/utils/decorators';
import { ApiConflictException, ApiNotFoundException } from '@/utils/exception';
import { ApiTrancingInput } from '@/utils/request';
import { IUsecase } from '@/utils/usecase';
import { UUIDUtils } from '@/utils/uuid';
import { Infer, InputValidator } from '@/utils/validator';

import { UserEntity, UserEntitySchema } from '../entity/user';
import { UserPasswordEntity, UserPasswordEntitySchema } from '../entity/user-password';
import { IUserRepository } from '../repository/user';

export const UserCreateSchema = UserEntitySchema.pick({
  fullName: true
})
  .merge(
    AccountEntitySchema.pick({
      email: true,
      username: true
    })
  )
  .merge(UserPasswordEntitySchema.pick({ password: true }))
  .merge(InputValidator.object({ roles: InputValidator.array(InputValidator.nativeEnum(RoleEnum)).min(1) }));

export class UserCreateUsecase implements IUsecase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly accountRepository: IAccountRepository,
    private readonly loggerService: ILoggerAdapter,
    private readonly event: IEventAdapter,
    private readonly roleRepository: IRoleRepository
  ) {}

  @ValidateSchema(UserCreateSchema)
  async execute(input: UserCreateInput, { tracing, user: userData }: ApiTrancingInput): Promise<UserCreateOutput> {
    const roles = await this.roleRepository.findIn({ name: input.roles });

    if (roles.length < input.roles.length) {
      throw new ApiNotFoundException('roleNotFound');
    }

    const accountId = UUIDUtils.create();
    const userId = UUIDUtils.create();

    const accountEntity = new AccountEntity({
      id: accountId,
      email: input.email,
      username: input.username,
      roles,
      isActive: true
    });

    const passwordEntity = new UserPasswordEntity({ id: UUIDUtils.create(), password: input.password });
    passwordEntity.createPassword();
    accountEntity.password = passwordEntity;

    const userEntity = new UserEntity({
      id: userId,
      accountId,
      fullName: input.fullName
    });

    const accountExists = await this.accountRepository.findOne({
      email: accountEntity.email
    });

    if (accountExists) {
      throw new ApiConflictException('userExists');
    }

    const usernameExists = await this.accountRepository.findOne({
      username: accountEntity.username
    });

    if (usernameExists) {
      throw new ApiConflictException('usernameExists');
    }

    const account = await this.accountRepository.create(accountEntity);
    const user = await this.userRepository.create(userEntity);

    this.loggerService.info({ message: 'user created successfully', obj: { user, account } });

    this.event.emit<SendEmailInput>(EventNameEnum.SEND_EMAIL, {
      email: input.email,
      subject: 'Welcome',
      template: 'welcome',
      payload: { name: input.fullName }
    });

    tracing.logEvent('user-created', `user: ${accountEntity.email} created by: ${userData.email}`);

    return user;
  }
}

export type UserCreateInput = Infer<typeof UserCreateSchema>;
export type UserCreateOutput = CreatedModel;
