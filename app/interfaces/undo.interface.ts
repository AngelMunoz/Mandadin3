import { IMiListaItem } from "./mi-lista.interface";

export interface UndoArgs {
  item: IMiListaItem;
  action: "MarkAsDone" | "MarkAsUndone";
  prevIndex: number;
}
