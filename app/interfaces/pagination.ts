export type PaginationResults<T> = [number, Array<T>];

export type WhereFunc<T> = (item: T) => boolean;

export interface OrderParams<T> {
  property: keyof T;
  direction: "asc" | "desc";
}

export interface PaginationArgs<T> {
  page: number;
  limit: number;
  find?: LokiQuery<T>;
  where?: WhereFunc<T>;
}
