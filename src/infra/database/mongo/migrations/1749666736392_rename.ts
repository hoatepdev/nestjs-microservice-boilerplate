import { Db } from 'mongodb';
import { MigrationInterface } from 'mongo-migrate-ts';

export class rename1749666736392 implements MigrationInterface {
  public async up(db: Db): Promise<void | never> {}

  public async down(db: Db): Promise<void | never> {}
}
