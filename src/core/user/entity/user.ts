import { AccountEntity, AccountEntitySchema } from '@/core/account/entity/account';
import { BaseEntity } from '@/utils/entity';
import { Infer, InputValidator } from '@/utils/validator';

const ID = InputValidator.string().uuid();
const AccountId = InputValidator.string().uuid();
const FullName = InputValidator.string();
const DateOfBirth = InputValidator.date().nullish();
const Gender = InputValidator.enum(['male', 'female', 'other']).nullish();
const Avatar = InputValidator.string().url().nullish();
const Phone = InputValidator.string().nullish();
const CreatedAt = InputValidator.date().nullish();
const UpdatedAt = InputValidator.date().nullish();
const DeletedAt = InputValidator.date().nullish();

export const UserEntitySchema = InputValidator.object({
  id: ID,
  accountId: AccountId,
  fullName: FullName,
  dateOfBirth: DateOfBirth,
  gender: Gender,
  avatar: Avatar,
  phone: Phone,
  account: AccountEntitySchema.optional(),
  createdAt: CreatedAt,
  updatedAt: UpdatedAt,
  deletedAt: DeletedAt
});

type User = Infer<typeof UserEntitySchema>;

export class UserEntity extends BaseEntity<UserEntity>() {
  accountId!: string;

  fullName!: string;

  dateOfBirth?: Date;

  gender?: 'male' | 'female' | 'other';

  avatar?: string;

  phone?: string;

  account?: AccountEntity;

  constructor(entity: User) {
    super(UserEntitySchema);
    Object.assign(this, this.validate(entity));
  }
}
