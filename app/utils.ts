import { IMiListaItem } from "./interfaces/mi-lista.interface";

// tslint:disable-next-line: no-bitwise
export const randomHex = () => "00000".replace(/0/g, () => (~~(Math.random() * 16)).toString(16));

export const getOffset = (page: number, limit: number) => (page - 1) * limit;

function parseLine(line: string, lista: number): Partial<IMiListaItem> {
  let [done, item] = line.split("] ");
  if (!done && !item) { return; }
  if (done && !item) {
    item = done;
    done = "";
  }

  return { isDone: done.includes("x"), item, listaId: lista };
}

export function parseList(list: string, belongsTo: number) {
  return list.split("\n").map(line => parseLine(line, belongsTo)).filter(item => item);
}
