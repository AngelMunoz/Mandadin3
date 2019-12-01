import { DatabaseService } from "./database.service";
import { PaginationArgs, WhereParams } from "~/interfaces/pagination";
import { MiLista } from "~/interfaces/mi-lista.interface";
import { QueryMeta } from "nativescript-couchbase-plugin";

export class MiListaService {

  private readonly $database: DatabaseService;

  constructor() {
    this.$database = new DatabaseService("misListas");
  }

  find({ limit, page, select, where, order }: PaginationArgs<MiLista>) {
    return this.$database.db.query({
      limit,
      offset: (page - 1) * limit,
      select,
      where,
      order
    }) as Array<MiLista>;
  }

  findOne(id: string) {
    return this.$database.db.getDocument(id) as MiLista;
  }

  exists(title: string) {
    const results = this.$database.db.query({
      select: [QueryMeta.ID],
      where: [{ property: "title", comparison: "equalTo", value: title }] as Array<WhereParams<MiLista>>
    });

    return results.length > 0;
  }

  create(lista: MiLista) {
    return this.$database.db.createDocument(lista, lista.id) as string;
  }

  update(lista: MiLista) {
    return this.$database.db.updateDocument(lista.id, lista);
  }

  destroy(id: string) {
    return this.$database.db.deleteDocument(id) as boolean;
  }
}

export default new MiListaService();
