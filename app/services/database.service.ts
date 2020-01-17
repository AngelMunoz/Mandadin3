import { createConnection, Connection } from "typeorm/browser";
import { Todo, MiLista, MiListaItem } from "~/models";

export class DatabaseService {

  private _connection: Connection;

  start() {
    return createConnection({
      database: "mandadin.db",
      type: "nativescript",
      logging: true,
      entities: [Todo, MiLista, MiListaItem]
    })
      .then(connection => {
        this._connection = connection;

        return connection.synchronize(false).then(() => connection);
      });
  }

  get connection() {
    return this._connection;
  }
}

export default new DatabaseService();
