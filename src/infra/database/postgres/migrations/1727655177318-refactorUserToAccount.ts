import { MigrationInterface, QueryRunner } from 'typeorm';

export class refactorUserToAccount1727655177318 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "accounts" (
        "id" uuid NOT NULL,
        "email" text NOT NULL,
        "username" text NOT NULL,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "password_id" uuid,
        CONSTRAINT "REL_accounts_password" UNIQUE ("password_id"),
        CONSTRAINT "PK_accounts" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_accounts_email" UNIQUE ("email"),
        CONSTRAINT "UQ_accounts_username" UNIQUE ("username")
      )`
    );

    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "accounts_roles" (
        "accounts_id" uuid NOT NULL,
        "roles_id" uuid NOT NULL,
        CONSTRAINT "PK_accounts_roles" PRIMARY KEY ("accounts_id", "roles_id")
      )`
    );

    await queryRunner.query(`CREATE INDEX "IDX_accounts_roles_accounts" ON "accounts_roles" ("accounts_id")`);

    await queryRunner.query(`CREATE INDEX "IDX_accounts_roles_roles" ON "accounts_roles" ("roles_id")`);

    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN "account_id" uuid`);

    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN "full_name" text`);

    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN "date_of_birth" date`);

    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN "gender" character varying CHECK ("gender" IN ('male', 'female', 'other'))`
    );

    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN "avatar" text`);

    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN "phone" text`);

    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "name"`);

    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "email"`);

    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "password_id"`);

    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_users_account" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    );

    await queryRunner.query(
      `ALTER TABLE "accounts" ADD CONSTRAINT "FK_accounts_password" FOREIGN KEY ("password_id") REFERENCES "users_password"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );

    await queryRunner.query(
      `ALTER TABLE "accounts_roles" ADD CONSTRAINT "FK_accounts_roles_accounts" FOREIGN KEY ("accounts_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    );

    await queryRunner.query(
      `ALTER TABLE "accounts_roles" ADD CONSTRAINT "FK_accounts_roles_roles" FOREIGN KEY ("roles_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    );

    await queryRunner.query(`ALTER TABLE "reset_password" DROP CONSTRAINT "FK_de65040d842349a5e6428ff21e6"`);

    await queryRunner.query(
      `ALTER TABLE "reset_password" ADD CONSTRAINT "FK_reset_password_account" FOREIGN KEY ("user_id") REFERENCES "accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );

    await queryRunner.query(`ALTER TABLE "users_roles" DROP CONSTRAINT "FK_259b5a2e24d0a5480262a774e46"`);

    await queryRunner.query(
      `ALTER TABLE "users_roles" ADD CONSTRAINT "FK_users_roles_users" FOREIGN KEY ("users_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users_roles" DROP CONSTRAINT "FK_users_roles_users"`);

    await queryRunner.query(
      `ALTER TABLE "users_roles" ADD CONSTRAINT "FK_259b5a2e24d0a5480262a774e46" FOREIGN KEY ("users_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    );

    await queryRunner.query(`ALTER TABLE "reset_password" DROP CONSTRAINT "FK_reset_password_account"`);

    await queryRunner.query(
      `ALTER TABLE "reset_password" ADD CONSTRAINT "FK_de65040d842349a5e6428ff21e6" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );

    await queryRunner.query(`ALTER TABLE "accounts_roles" DROP CONSTRAINT "FK_accounts_roles_roles"`);

    await queryRunner.query(`ALTER TABLE "accounts_roles" DROP CONSTRAINT "FK_accounts_roles_accounts"`);

    await queryRunner.query(`ALTER TABLE "accounts" DROP CONSTRAINT "FK_accounts_password"`);

    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_users_account"`);

    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN "password_id" uuid`);

    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN "email" text`);

    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN "name" text`);

    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "phone"`);

    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "avatar"`);

    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "gender"`);

    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "date_of_birth"`);

    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "full_name"`);

    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "account_id"`);

    await queryRunner.query(`DROP INDEX "IDX_accounts_roles_roles"`);

    await queryRunner.query(`DROP INDEX "IDX_accounts_roles_accounts"`);

    await queryRunner.query(`DROP TABLE "accounts_roles"`);

    await queryRunner.query(`DROP TABLE "accounts"`);
  }
}
