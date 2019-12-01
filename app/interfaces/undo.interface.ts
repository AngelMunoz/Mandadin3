import { MiListaItem } from "./mi-lista.interface";

export interface UndoArgs {
  item: MiListaItem;
  action: "MarkAsDone" | "MarkAsUndone";
  prevIndex: number;
}
