import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedDb1685132385278 implements MigrationInterface {
  name = 'SeedDb1685132385278';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO tags (name) VALUES ('dragons'), ('coffee'), ('nestjs')`,
    );

    // password is 'test'
    await queryRunner.query(
      `INSERT INTO users (username, email, password) VALUES ('test', 'test@gmail.com', '$2b$10$Ub.NJbAu7dVMHVoFNhClsOF62FbXQ4EY0DEi.M9dDCbu1gUK31ksi')`,
    );

    await queryRunner.query(
      `INSERT INTO articles (slug, title, description, body, "tagList", "authorId") VALUES ('first-article', 'First article', 'first article description', 'first article body', 'coffee,dragons', 1)`,
    );

    await queryRunner.query(
      `INSERT INTO articles (slug, title, description, body, "tagList", "authorId") VALUES ('second-article', 'Second article', 'second article description', 'second article body', 'angularjs,reactjs', 1)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
