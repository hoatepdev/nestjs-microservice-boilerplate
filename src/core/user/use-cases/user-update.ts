import { ILoggerAdapter } from '@/infra/logger';
import { ValidateSchema } from '@/utils/decorators';
import { ApiNotFoundException } from '@/utils/exception';
import { ApiTrancingInput } from '@/utils/request';
import { IUsecase } from '@/utils/usecase';
import { Infer } from '@/utils/validator';

import { UserEntity, UserEntitySchema } from '../entity/user';
import { IUserRepository } from '../repository/user';

export const UserUpdateSchema = UserEntitySchema.pick({
  id: true
})
  .merge(
    UserEntitySchema.pick({ fullName: true, dateOfBirth: true, gender: true, avatar: true, phone: true }).partial()
  )
  .strict();

export class UserUpdateUsecase implements IUsecase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly loggerService: ILoggerAdapter
  ) {}

  @ValidateSchema(UserUpdateSchema)
  async execute(input: UserUpdateInput, { tracing, user: userData }: ApiTrancingInput): Promise<UserUpdateOutput> {
    const user = await this.userRepository.findOneWithRelation({ id: input.id }, { account: true });

    if (!user || !user.account) {
      throw new ApiNotFoundException('userNotFound');
    }

    const entity = new UserEntity({ ...user, ...input });

    await this.userRepository.create(entity);

    this.loggerService.info({ message: 'user updated.', obj: { user: input } });

    const updated = await this.userRepository.findOne({ id: entity.id });

    const entityUpdated = new UserEntity(updated as UserEntity);

    tracing.logEvent('user-updated', `user: ${user.account.email} updated by: ${userData.email}`);

    return entityUpdated;
  }
}

export type UserUpdateInput = Partial<Infer<typeof UserUpdateSchema>>;
export type UserUpdateOutput = UserEntity;
