import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUser1626256402456 implements MigrationInterface {
    name = 'AddTeam1626256402456';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('CREATE TABLE "user" ("id" uuid NOT NULL, "email" character varying NOT NULL, "password_hash" character varying NOT NULL, CONSTRAINT "PK_f57d8293406df4af348402e4b74" PRIMARY KEY ("id"))');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('DROP TABLE "user"');
    }
}
