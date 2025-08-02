import { Test } from '@nestjs/testing';
import { TestMock } from 'test/mock';

import { AccountEntity } from '@/core/account/entity/account';
import { RoleEntity, RoleEnum } from '@/core/role/entity/role';
import { UserPasswordEntity } from '@/core/user/entity/user-password';
import { ITokenAdapter, TokenLibModule } from '@/libs/token';
import { ILoginAdapter } from '@/modules/login/adapter';
import { ApiBadRequestException, ApiNotFoundException } from '@/utils/exception';
import { ZodExceptionIssue } from '@/utils/validator';

import { UserEntity } from '../../entity/user';
import { IUserRepository } from '../../repository/user';
import { LoginInput, LoginOutput, LoginUsecase } from '../user-login';

describe(LoginUsecase.name, () => {
  let usecase: ILoginAdapter;
  let repository: IUserRepository;

  beforeEach(async () => {
    const app = await Test.createTestingModule({
      imports: [TokenLibModule],
      providers: [
        {
          provide: IUserRepository,
          useValue: {}
        },
        {
          provide: ILoginAdapter,
          useFactory: (userRepository: IUserRepository, token: ITokenAdapter) => {
            return new LoginUsecase(userRepository, token);
          },
          inject: [IUserRepository, ITokenAdapter]
        }
      ]
    }).compile();

    usecase = app.get(ILoginAdapter);
    repository = app.get(IUserRepository);
  });

  test('when no input is specified, should expect an error', async () => {
    await TestMock.expectZodError(
      () => usecase.execute({} as LoginInput, TestMock.getMockTracing()),
      (issues: ZodExceptionIssue[]) => {
        expect(issues).toEqual([
          { message: 'Required', path: TestMock.nameOf<LoginInput>('accountId') },
          { message: 'Required', path: TestMock.nameOf<LoginInput>('password') }
        ]);
      }
    );
  });

  const input: LoginInput = { accountId: TestMock.getMockUUID(), password: '****' };
  test('when user not found, should expect an error', async () => {
    repository.findOneWithRelation = TestMock.mockResolvedValue<UserEntity>(null);

    await expect(usecase.execute(input, TestMock.getMockTracing())).rejects.toThrow(ApiNotFoundException);
  });

  const account = new AccountEntity({
    id: TestMock.getMockUUID(),
    email: 'admin@admin.com',
    username: 'Admin',
    roles: [new RoleEntity({ id: TestMock.getMockUUID(), name: RoleEnum.USER })],
    password: new UserPasswordEntity({ id: TestMock.getMockUUID(), password: '***' }),
    isActive: true
  });

  const user = new UserEntity({
    id: TestMock.getMockUUID(),
    accountId: account.id,
    fullName: 'Admin User',
    account
  });

  test('when user role not found, should expect an error', async () => {
    const userWithoutRoles = new UserEntity({
      ...user,
      account: new AccountEntity({
        ...account,
        roles: []
      })
    });
    repository.findOneWithRelation = TestMock.mockResolvedValue<UserEntity>(userWithoutRoles);

    await expect(usecase.execute(input, TestMock.getMockTracing())).rejects.toThrow(ApiNotFoundException);
  });

  test('when password is incorrect, should expect an error', async () => {
    repository.findOneWithRelation = TestMock.mockResolvedValue<UserEntity>(user);

    await expect(usecase.execute(input, TestMock.getMockTracing())).rejects.toThrow(ApiBadRequestException);
  });

  test('when user login successfully, should expect a token', async () => {
    const userWithCorrectPassword = new UserEntity({
      ...user,
      account: new AccountEntity({
        ...account,
        password: new UserPasswordEntity({
          id: TestMock.getMockUUID(),
          password: '69bf0bc46f51b33377c4f3d92caf876714f6bbbe99e7544487327920873f9820'
        })
      })
    });
    repository.findOneWithRelation = TestMock.mockResolvedValue<UserEntity>(userWithCorrectPassword);

    await expect(usecase.execute(input, TestMock.getMockTracing())).resolves.toEqual({
      accessToken: expect.any(String),
      refreshToken: expect.any(String)
    } as LoginOutput);
  });
});
