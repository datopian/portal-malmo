import type {
  ColumnSort,
  PaginationState,
  ColumnFilter,
} from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import type { CkanResponse } from "./ckan.interface";
import { DataExplorerColumnFilter } from "./DataExplorerInner";

/**
 * CKAN base URL
 */
const ckanUrl = process.env.NEXT_PUBLIC_DMS ?? "";

/**
 * Generic "unknown record" helper.
 * Prefer unknown over any for external/untrusted data.
 */
type UnknownRecord = Record<string, unknown>;

/**
 * Column shape returned by useFields (matches current behavior).
 */
export interface FieldColumn {
  key: string;
  name: string;
  type: string;
  default: string;
}

export interface DatastoreMeta {
  id: string;
  count: number;
  table_type: string;
  size: number;
  db_size: number;
  idx_size: number;
  aliases: string[];
}

export interface DatastoreFieldInfo {
  allowed_values: string;
  example_value: string;
  field_name: string;
  notes: string;
  type_override: string;
  units: string;
  label?: string | null;
  default?: string | null;
}

export interface DatastoreFieldSchema {
  native_type: string;
  notnull: boolean;
  index_name: string;
  is_index: boolean;
  uniquekey: boolean;
}

export interface DatastoreField {
  id: string;
  type: string;
  info: DatastoreFieldInfo;
  schema: DatastoreFieldSchema;
}

/**
 * Your UI layer can treat this as the "fields response".
 * (Kept similar intent, but now strongly typed.)
 */
export interface FieldsResponse {
  tableName: string;
  meta: DatastoreMeta;
  fields: DatastoreField[];
  columns: FieldColumn[];
}

/**
 * CKAN datastore_info response shape (only what you use).
 */
type DatastoreInfoResponse = CkanResponse<{
  meta: DatastoreMeta;
  fields: DatastoreField[];
}>;

/**
 * CKAN SQL response shape used in this file.
 */
export type DataResponse<TRecord extends UnknownRecord = UnknownRecord> =
  CkanResponse<{
    sql: string;
    records: TRecord[];
    fields: UnknownRecord[];
  }>;

/**
 * Filter clause shape used in your SQL building.
 * This matches your current usage: value, operation.value, optional link.
 */
type FilterOperation = { value: string };
type FilterLink = string;
type FilterClause = {
  value: string | number | boolean;
  operation: FilterOperation;
  link?: FilterLink;
};

/**
 * Small helper: normalize ColumnFilter value into FilterClause[] safely.
 * Logic is identical: it only returns clauses if value is an array.
 */
function asFilterClauses(value: unknown): FilterClause[] {
  if (!Array.isArray(value)) return [];
  return value as FilterClause[];
}

function escapeSqlValue(value: FilterClause["value"]) {
  return String(value).replace(/'/g, "''");
}


export function toSqlOperator(op: string, value: string) {
  switch (op) {
    case "=":
      return `= '${value}'`;

    case "!=":
      return `!= '${value}'`;

    case ">":
      return `> '${value}'`;

    case ">=":
      return `>= '${value}'`;

    case "<":
      return `< '${value}'`;

    case "<=":
      return `<= '${value}'`;

    case "contains":
      return `ILIKE '%${value}%'`;

    case "not_contains":
      return `NOT ILIKE '%${value}%'`;

    case "starts_with":
      return `ILIKE '${value}%'`;

    case "ends_with":
      return `ILIKE '%${value}'`;

    default:
      throw new Error("Unknown operator");
  }
}

function buildFilterGroupSql(filterId: string, clauses: FilterClause[]) {
  const cleaned = clauses.filter((c) => c.value !== "");
  if (cleaned.length === 0) return "";

  return cleaned
    .map((c, idx) => {
      const op = String(c.operation?.value ?? "=");
      const v = escapeSqlValue(c.value);


      // first clause has no link
      if (idx === 0) {
        return `"${filterId}" ${toSqlOperator(op,v)}`;
      }

      const raw = String(c.link ?? "AND")
        .trim()
        .toUpperCase();
      const link = raw === "OR" ? "OR" : "AND"; // whitelist

      return `${link} "${filterId}" ${toSqlOperator(op,v)}`;
    })
    .join(" ");
}


/**
 * Small helper: standardize CKAN error throwing.
 */
function assertCkanSuccess<T>(
  res: CkanResponse<T>,
): asserts res is CkanResponse<T> & { success: true; result: T } {
  if (!res.success) {
    const message = res.error?.message
      ? res.error.message
      : res.error
        ? JSON.stringify(res.error)
        : "CKAN request failed";
    throw new Error(message);
  }
}

export function useFields(resourceId: string) {
  return useQuery<FieldsResponse>({
    queryKey: ["fields", resourceId],
    queryFn: async () => {
      const fieldsRes = await fetch(`${ckanUrl}/api/3/action/datastore_info`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: resourceId }),
      });

      const fields: DatastoreInfoResponse = await fieldsRes.json();
      assertCkanSuccess(fields);

      return {
        tableName: resourceId,
        meta: fields.result.meta,
        fields: fields.result.fields,
        columns: fields.result.fields.map((field) => ({
          key: field.id,
          name: field.info.field_name ?? field.info.label ?? field.id,
          type: field.type,
          default: field.info.default ?? field.info.example_value ?? "",
        })),
      };
    },
  });
}

export function useNumberOfRows({
  resourceId,
  filters,
}: {
  resourceId: string;
  filters: DataExplorerColumnFilter[];
}) {
  return useQuery<number>({
    queryKey: ["query", resourceId, filters],
    queryFn: async () => {
      const filtersSql =
        filters.length > 0
          ? "WHERE " +
            filters
              .map((filter) => {
                const clauses = asFilterClauses(filter.value);
                const group = buildFilterGroupSql(filter.id, clauses);
                return group ? `(${group})` : "";
              })
              .filter(Boolean)
              .join(" AND ")
          : "";

      const url = `${ckanUrl}/api/action/datastore_search_sql?sql=SELECT count(*) FROM "${resourceId}" ${filtersSql}`;

      const numRowsRes = await fetch(url, {
        headers: { "Content-Type": "application/json" },
      });

      // count(*) typically returns { count: number } (often as number, sometimes as string depending on backend)
      type CountRecord = { count: number } | { count: string };
      const numRows: DataResponse<CountRecord> = await numRowsRes.json();
      assertCkanSuccess(numRows);

      const first = numRows.result.records[0];
      if (!first || first.count === undefined || first.count === null) {
        throw new Error("Could not get number of rows");
      }

      // Keep behavior: return a number; coerce if backend returns string.
      const count =
        typeof first.count === "string" ? Number(first.count) : first.count;
      if (Number.isNaN(count)) throw new Error("Could not get number of rows");

      return count;
    },
    placeholderData: (previousData) => previousData,
  });
}

export function useTableData({
  resourceId,
  pagination,
  columns,
  sorting,
  enabled = true,
  filters,
}: {
  resourceId: string;
  pagination: PaginationState;
  columns: string[];
  sorting: ColumnSort[];
  enabled?: boolean;
  filters: ColumnFilter[];
}) {
  return useQuery<UnknownRecord[]>({
    queryKey: ["query", resourceId, pagination, columns, sorting, filters],
    queryFn: async () => {
      const offset = pagination.pageIndex * pagination.pageSize;
      const limit = pagination.pageSize;

      const paginationSql = `LIMIT ${limit} OFFSET ${offset}`;

      const sortSql =
        sorting.length > 0
          ? "ORDER BY " +
            sorting
              .map((sort) => `"${sort.id}" ${sort.desc ? "DESC" : "ASC"}`)
              .join(", ")
          : "";

      const filtersSql =
        filters.length > 0
          ? "WHERE " +
            filters
              .map((filter) => {
                const clauses = asFilterClauses(filter.value);
                const group = buildFilterGroupSql(filter.id, clauses);
                return group ? `(${group})` : "";
              })
              .filter(Boolean)
              .join(" AND ")
          : "";

      const parsedColumns = columns.map((column) => `"${column}"`);

      const url = `${ckanUrl}/api/action/datastore_search_sql?sql=SELECT ${parsedColumns.join(
        " , ",
      )} FROM "${resourceId}" ${filtersSql} ${sortSql} ${paginationSql}`;

      const tableDataRes = await fetch(url, {
        headers: { "Content-Type": "application/json" },
      });

      const tableData: DataResponse = await tableDataRes.json();
      assertCkanSuccess(tableData);

      return tableData.result.records;
    },
    enabled,
    placeholderData: (previousData) => previousData,
  });
}
