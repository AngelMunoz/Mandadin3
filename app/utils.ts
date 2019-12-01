import { MiListaItem } from "./interfaces/mi-lista.interface";

// tslint:disable-next-line: no-bitwise
export const randomHex = () => "00000".replace(/0/g, () => (~~(Math.random() * 16)).toString(16));

function parseLine(line: string, lista: string): MiListaItem {
  let [done, item] = line.split("] ");
  if (!done && !item) { return; }
  if (done && !item) {
    item = done;
    done = "";
  }

  return { id: `${Date.now()}:${randomHex()}`, isDone: done.includes("x"), item, lista };
}

export function parseList(list: string, belongsTo: string) {
  return list.split("\n").map(line => parseLine(line, belongsTo)).filter(item => item);
}
