import databaseService, { DatabaseService } from "./database.service";
import { PaginationArgs, WhereFunc, PaginationResults } from "~/interfaces/pagination";
import { Todo } from "~/interfaces/todo.interface";
import { getOffset } from "~/utils";

export class TodoService {

  private readonly _$collection: Collection<Todo>;

  constructor(db: DatabaseService) {
    this._$collection = db.collection<Todo>("todos");
  }

  find({ limit, page, where, find }: PaginationArgs<Todo>): PaginationResults<Todo> {
    const query = find ? find : {};
    const offset = getOffset(page, limit);
    let results: Array<Todo & LokiObj>;
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

  findOne(id: number) {
    return this._$collection.findOne({ $loki: id }) as Todo;
  }

  exists(title: string) {
    const results = this._$collection.find({ title });

    return results.length > 0;
  }

  create(lista: Todo) {
    return this._$collection.insert(lista);
  }

  update(lista: Todo) {
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
}

export default new TodoService(databaseService);
