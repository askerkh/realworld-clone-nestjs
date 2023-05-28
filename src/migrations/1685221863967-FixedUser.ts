import { MigrationInterface, QueryRunner } from "typeorm";

export class FixedUser1685221863967 implements MigrationInterface {
    name = 'FixedUser1685221863967'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "username" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "username"`);
    }

}
