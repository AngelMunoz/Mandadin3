import { MigrationInterface, QueryRunner, Table } from "typeorm/browser";

export class CreateTodos1579046400 implements MigrationInterface {

  async up(queryRunner: QueryRunner): Promise<any> {
    const todosTable = new Table({
      name: "todos",
      columns: [
        { name: "id", isPrimary: true, type: "int", isGenerated: true },
        { name: "title", type: "varchar", length: "200", isUnique: true },
        { name: "content", type: "text" }
      ]
    });

    return queryRunner.createTable(todosTable, true);
  }

  async down(queryRunner: QueryRunner): Promise<any> {
    return queryRunner.dropTable("todos", true);
  }

}
