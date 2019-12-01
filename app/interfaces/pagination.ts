import { QueryComparisonOperator, QueryLogicalOperator, QueryMeta } from "nativescript-couchbase-plugin";

export interface PaginationResults<T> {
  count: number;
  list: Array<T>;
}

export interface WhereParams<T> {
  property: keyof T;
  comparison: QueryComparisonOperator;
  logical?: QueryLogicalOperator;
  value: any;
}

export interface OrderParams<T> {
  property: keyof T;
  direction: "asc" | "desc";
}

export interface PaginationArgs<T> {
  page: number;
  limit: number;
  select?: Array<QueryMeta>;
  where?: Array<WhereParams<T>>;
  order?: Array<OrderParams<T>>;
}
