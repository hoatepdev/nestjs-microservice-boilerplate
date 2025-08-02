import { RoleEntity, RoleEntitySchema } from '@/core/role/entity/role';
import { UserPasswordEntity, UserPasswordEntitySchema } from '@/core/user/entity/user-password';
import { BaseEntity } from '@/utils/entity';
import { Infer, InputValidator } from '@/utils/validator';

const ID = InputValidator.string().uuid();
const Email = InputValidator.string().email();
const Username = InputValidator.string();
const Password = UserPasswordEntitySchema;
const Role = RoleEntitySchema;
const CreatedAt = InputValidator.date().nullish();
const UpdatedAt = InputValidator.date().nullish();
const DeletedAt = InputValidator.date().nullish();

export const AccountEntitySchema = InputValidator.object({
  id: ID,
  email: Email,
  username: Username,
  roles: InputValidator.array(Role.optional()).min(1),
  password: Password.optional(),
  isActive: InputValidator.boolean().default(true),
  createdAt: CreatedAt,
  updatedAt: UpdatedAt,
  deletedAt: DeletedAt
});

type Account = Infer<typeof AccountEntitySchema>;

export class AccountEntity extends BaseEntity<AccountEntity>() {
  email!: string;

  username!: string;

  roles!: RoleEntity[];

  password!: UserPasswordEntity;

  isActive!: boolean;

  constructor(entity: Account) {
    super(AccountEntitySchema);
    Object.assign(this, this.validate(entity));
  }
}
