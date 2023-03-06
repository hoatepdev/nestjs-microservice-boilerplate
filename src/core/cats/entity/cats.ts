import { z } from 'zod';

import { withID } from '@/utils/entity';
import { Entity } from '@/utils/postgres';

const ID = z.string().uuid();
const Name = z.string().trim().min(1).max(200);
const Breed = z.string().trim().min(1).max(200);
const Age = z.number().min(0).max(30);
const CreatedAt = z.date().nullish();
const UpdatedAt = z.date().nullish();
const DeletedAt = z.date().default(null).nullish();

export const CatsEntitySchema = z.object({
  id: ID,
  name: Name,
  breed: Breed,
  age: Age,
  createdAt: CreatedAt,
  updatedAt: UpdatedAt,
  deletedAt: DeletedAt
});

type Cat = z.infer<typeof CatsEntitySchema>;

export class CatsEntity extends Entity {
  name: string;

  breed: string;

  age: number;

  deletedAt?: Date;

  constructor(entity: Cat) {
    if (!entity) return;
    super();
    Object.assign(this, CatsEntitySchema.parse(withID(entity)));
  }
}
