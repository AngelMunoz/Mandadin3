import { DatabaseService } from "./database.service";
import { PaginationArgs, WhereParams } from "~/interfaces/pagination";
import { Todo } from "~/interfaces/todo.interface";
import { QueryMeta } from "nativescript-couchbase-plugin";

export class TodoService {

  private readonly $database: DatabaseService;

  constructor() {
    this.$database = new DatabaseService("todos");
  }

  find({ limit, page, select, where, order }: PaginationArgs<Todo>) {
    return this.$database.db.query({
      limit,
      offset: (page - 1) * limit,
      select,
      where,
      order
    }) as Array<Todo>;
  }

  findOne(id: string) {
    return this.$database.db.getDocument(id) as Todo;
  }

  exists(title: string) {
    const results = this.$database.db.query({
      select: [QueryMeta.ID],
      where: [{ property: "title", comparison: "equalTo", value: title }] as Array<WhereParams<Todo>>
    });

    return results.length > 0;
  }

  create(todo: Todo) {
    return this.$database.db.createDocument(todo, todo.id) as string;
  }

  update(todo: Todo) {
    return this.$database.db.updateDocument(todo.id, todo);
  }

  destroy(id: string) {
    return this.$database.db.deleteDocument(id) as boolean;
  }
}

export default new TodoService();
