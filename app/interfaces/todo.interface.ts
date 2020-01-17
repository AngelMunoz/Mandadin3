import { BaseModel } from "./base.interface";

export interface ITodo extends BaseModel {
  title?: string;
  content?: string;
}
