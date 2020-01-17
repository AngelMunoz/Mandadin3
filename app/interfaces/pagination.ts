
export type PaginationResults<T> = [number, Array<T>];

export type WhereFunc<T> = (item: T) => boolean;

export interface IOrderParams<T> {
  property: keyof T;
  direction: "asc" | "desc";
}

export interface IPaginationArgs<T> {
  page: number;
  limit: number;
  find?: Partial<T>;
}
