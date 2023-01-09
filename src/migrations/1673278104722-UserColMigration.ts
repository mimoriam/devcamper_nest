import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserColMigration1673278104722 implements MigrationInterface {
  name = 'UserColMigration1673278104722';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users"
        RENAME COLUMN "name" TO "name2"`);
    await queryRunner.query(`ALTER TABLE "users"
        RENAME CONSTRAINT "UQ_51b8b26ac168fbe7d6f5653e6cf" TO "UQ_f96cd8f5347b9909848da3853a5"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users"
        RENAME CONSTRAINT "UQ_f96cd8f5347b9909848da3853a5" TO "UQ_51b8b26ac168fbe7d6f5653e6cf"`);
    await queryRunner.query(`ALTER TABLE "users"
        RENAME COLUMN "name2" TO "name"`);
  }
}
