import { BaseModel } from "./base.interface";

export interface Todo extends BaseModel {
  title?: string;
  content?: string;
}
