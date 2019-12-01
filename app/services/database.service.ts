import { Couchbase } from "nativescript-couchbase-plugin";

export class DatabaseService {

  private readonly _db: Couchbase;

  constructor(name = "mandadin") {
    this._db = new Couchbase(name);
  }

  get db() {
    return this._db;
  }
}
