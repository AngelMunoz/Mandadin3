import databaseService, { DatabaseService } from "./database.service";
import { PaginationArgs, PaginationResults } from "~/interfaces/pagination";
import { MiListaItem } from "~/interfaces/mi-lista.interface";
import { getOffset } from "~/utils";

export class MiListaItemService {

  private readonly _$collection: Collection<MiListaItem>;

  constructor(db: DatabaseService) {
    this._$collection = db.collection<MiListaItem>("milistaitems");
  }

  find({ limit, page, where, find }: PaginationArgs<MiListaItem>): PaginationResults<MiListaItem> {
    const query = find ? find : {};
    const offset = getOffset(page, limit);
    let results: Array<MiListaItem & LokiObj>;
    const resultset = this._$collection
      .chain()
      .find(query)
      .limit(limit)
      .offset(offset);
    const precount = resultset.copy();
    let count = 0;
    if (where) {
      results = resultset.where(where).data();
      count = precount.where(where).count();
    } else {
      results = resultset.data();
      count = precount.count();
    }

    return [count, results];
  }

  findAllInList(listaId: number, hideDone?: boolean) {
    let findObj: Partial<MiListaItem> = { lista: listaId };
    if (hideDone) {
      findObj = { ...findObj, isDone: false };
    }

    return this._$collection.find(findObj);
  }

  findOne(id: number) {
    return this._$collection.findOne({ $loki: id }) as MiListaItem;
  }

  exists(item: string) {
    const results = this._$collection.find({ item });

    return results.length > 0;
  }

  create(lista: MiListaItem) {
    return this._$collection.insert(lista);
  }

  update(lista: MiListaItem) {
    return this._$collection.update(lista);
  }

  destroy(id: number) {
    try {
      this._$collection.remove(id);

      return true;
    } catch (error) {

      return false;
    }

  }

  destroyAll(listaId: number) {
    const results = this.findAllInList(listaId);

    return results.map(result => this.destroy(result.$loki)).every(deleted => deleted);
  }
}

export default new MiListaItemService(databaseService);
