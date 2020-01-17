import { MigrationInterface, QueryRunner, Table } from "typeorm/browser";

export class CreateMyList1579050000 implements MigrationInterface {

  async up(queryRunner: QueryRunner): Promise<any> {
    const milistaTable = new Table({
      name: "mis_listas",
      columns: [
        { name: "id", isPrimary: true, type: "int", isGenerated: true },
        { name: "title", type: "varchar", length: "200", isUnique: true },
        { name: "hideDone", type: "boolean" }
      ]
    });

    const miListaItemTable = new Table({
      name: "mi_lista_items",
      columns: [
        { name: "id", isPrimary: true, type: "int", isGenerated: true },
        { name: "item", type: "varchar", length: "250", isUnique: true },
        { name: "isDone", type: "boolean" },
        { name: "listaId", type: "int" }
      ],
      foreignKeys: [
        {
          name: "mi_lista_item_fk",
          columnNames: ["listaId"],
          referencedColumnNames: ["id"],
          referencedTableName: "mis_listas",
          onDelete: "CASCADE",
          onUpdate: "CASCADE"
        }
      ]
    });

    return queryRunner.createTable(milistaTable, true)
      .then(() => queryRunner.createTable(miListaItemTable, true));
  }

  async down(queryRunner: QueryRunner): Promise<any> {
    return queryRunner.dropTable("mi_lista_items", true, true)
      .then(() => queryRunner.dropTable("mis_listas", true));
  }
}
