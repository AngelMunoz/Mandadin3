import { BaseModel } from "./base.interface";

export interface MiLista extends BaseModel {
  title: string;
  hideDone: boolean;
}

export interface MiListaItem extends BaseModel {
  lista: number;
  item: string;
  isDone: boolean;
}
