import * as LokiDB from "lokijs";
import * as LokiNativescriptAdapter from "lokijs/src/loki-nativescript-adapter";

export class DatabaseService {

  private readonly _db: Loki;
  private readonly _collections: Array<[string, Array<string>, Array<string>]> = [
    ["todos", ["title"], []],
    ["mislistas", [], ["title"]],
    ["milistaitems", ["lista"], ["item"]]
  ];

  constructor(name = "mandadin.json") {
    this._db = new LokiDB(name, {
      adapter: new LokiNativescriptAdapter(),
      autoload: true,
      env: "NATIVESCRIPT",
      autoloadCallback: this._onLoad.bind(this)
    });
  }

  get db() {
    return this._db;
  }

  ensureCollections() {
    for (const [colName, indices, uniques] of this._collections) {
      if (!this._db.getCollection(colName)) {
        this.ensureCollection(colName, indices, uniques);
      }
    }
  }

  ensureCollection(colName, indices?, uniques?) {
    const col = this._db.addCollection(colName, {
      indices: indices ? indices : [],
      unique: uniques ? uniques : []
    });
    col.ensureAllIndexes();
  }

  collection<T extends object>(name: string) {
    return this._db.getCollection<T>(name);
  }

  private _onLoad() {
    this.ensureCollections();
  }

}

export default new DatabaseService();
