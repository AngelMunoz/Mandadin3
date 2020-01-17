import { BaseModel } from "./base.interface";
import { MiLista } from "~/models";

export interface IMiLista extends BaseModel {
  title: string;
  hideDone: boolean;
  items?: Array<IMiListaItem>;
}

export interface IMiListaItem extends BaseModel {
  item: string;
  isDone: boolean;
  lista?: MiLista;
  listaId: number;
}
