import { DatabaseService } from "./database.service";
import { PaginationArgs, WhereParams } from "~/interfaces/pagination";
import { MiListaItem } from "~/interfaces/mi-lista.interface";
import { QueryMeta } from "nativescript-couchbase-plugin";

export class MiListaItemService {

  private readonly $database: DatabaseService;

  constructor() {
    this.$database = new DatabaseService("miListaItems");
  }

  find({ limit, page, select, where, order }: PaginationArgs<MiListaItem>) {
    return this.$database.db.query({
      limit,
      offset: (page - 1) * limit,
      select,
      where,
      order
    }) as Array<MiListaItem>;
  }

  findAllInList(listaId: string, hideDone?: boolean) {
    const where: Array<WhereParams<MiListaItem>> = [];
    if (hideDone) {
      where.push({ property: "isDone", comparison: "equalTo", value: false });
    }
    where.push({ property: "lista", comparison: "equalTo", value: listaId });

    return this.$database.db.query({
      select: [QueryMeta.ID],
      where
    }) as Array<MiListaItem>;
  }

  findOne(id: string) {
    return this.$database.db.getDocument(id) as MiListaItem;
  }

  exists(item: string) {
    const results = this.$database.db.query({
      select: [QueryMeta.ID],
      where: [{ property: "item", comparison: "equalTo", value: item }] as Array<WhereParams<MiListaItem>>
    });

    return results.length > 0;
  }

  create(lista: MiListaItem) {
    return this.$database.db.createDocument(lista, lista.id) as string;
  }

  update(lista: MiListaItem) {
    return this.$database.db.updateDocument(lista.id, lista);
  }

  destroy(id: string) {
    return this.$database.db.deleteDocument(id) as boolean;
  }

  destroyAll(listaId: string) {
    const results = this.$database.db.query({
      select: [QueryMeta.ID],
      where: [{ property: "lista", comparison: "equalTo", value: listaId }] as Array<WhereParams<MiListaItem>>
    });

    return results.map(result => this.destroy(result.id)).every(deleted => deleted);
  }
}

export default new MiListaItemService();
