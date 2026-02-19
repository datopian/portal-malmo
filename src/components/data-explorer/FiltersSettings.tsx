"use client";
import "@tanstack/react-table";
import { useMemo, useCallback, useEffect } from "react";
import type { RowData, Table } from "@tanstack/react-table";
import { useFieldArray, useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Minus, PlusCircleIcon } from "lucide-react";

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

import type { FilterObjType } from "./search.schema";
import { DatePicker } from "./DatePicker";

import { SelectIcon } from "@radix-ui/react-select";
import { DataExplorerColumnFilter } from "./DataExplorerInner";
import { Tooltip } from "./Tooltip";

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData extends RowData, TValue> {
    type: keyof TData;
    default?: TValue;
  }
}

export const OPERATIONS_LIST = [
  { label: "Equals", value: "=" },
  { label: "Not equal", value: "!=" },
  { label: "Greater than", value: ">" },
  { label: "Greater or equal", value: ">=" },
  { label: "Less than", value: "<" },
  { label: "Less or equal", value: "<=" },
  { label: "Contains", value: "contains" },
  { label: "Does not contain", value: "not_contains" },
  { label: "Starts with", value: "starts_with" },
  { label: "Ends with", value: "ends_with" },
] as const;

const LINK_OPTIONS = [
  { label: "AND", value: "AND" },
  { label: "OR", value: "OR" },
] as const;

type LinkValue = (typeof LINK_OPTIONS)[number]["value"];
type Op = FilterObjType["operation"];

const rowSchema = z.object({
  link: z.enum(["AND", "OR"]).nullable(),
  columnId: z.string().min(1),
  operation: z.object({ label: z.string(), value: z.string() }),
  value: z.string(),
});

const formSchema = z.object({
  rows: z.array(rowSchema),
});

type FormType = z.infer<typeof formSchema>;

type Props<TData extends object> = {
  table: Table<TData>;
  filters: DataExplorerColumnFilter[];
  setFilters: (filters: DataExplorerColumnFilter[]) => void;
};

function defaultOpForType(type?: string): Op {
  if (type === "timestamp") return { label: "Greater than", value: ">" };
  return { label: "Equals", value: "=" };
}

function operationsForType(type?: string) {
  // Your meta uses "numeric" and "timestamp" already.
  if (type === "numeric") {
    return OPERATIONS_LIST.filter((o) =>
      ["=", "!=", ">", ">=", "<", "<="].includes(o.value),
    );
  }

  if (type === "timestamp") {
    return OPERATIONS_LIST.filter((o) =>
      ["=", "!=", ">", ">=", "<", "<="].includes(o.value),
    );
  }

  // default: text (and anything else)
  return OPERATIONS_LIST.filter((o) =>
    [
      "=",
      "!=",
      "contains",
      "not_contains",
      "starts_with",
      "ends_with",
    ].includes(o.value),
  );
}

function normalizeLink(link: unknown): LinkValue {
  return String(link).toUpperCase() === "OR" ? "OR" : "AND";
}

function filtersToRows(filters: DataExplorerColumnFilter[]): FormType["rows"] {
  const rows: FormType["rows"] = [];

  for (const f of filters) {
    const clauses = Array.isArray(f.value) ? (f.value as FilterObjType[]) : [];

    for (const c of clauses) {
      const op = c.operation ?? { label: "Equals", value: "=" };

      rows.push({
        columnId: f.id,
        operation: op,
        value: String(c.value ?? ""),
        //first occurrence => link null, subsequent => AND/OR.
        link: c.link ? normalizeLink(c.link) : null,
      });
    }
  }
  return rows;
}

export function FiltersSettings<TData extends object>({
  table,
  filters,
  setFilters,
}: Props<TData>) {
  const filterableColumns = useMemo(
    () => table.getAllLeafColumns().filter((c) => c.getCanFilter()),
    [table],
  );

  const columnsById = useMemo(() => {
    const map = new Map<string, (typeof filterableColumns)[number]>();
    filterableColumns.forEach((c) => map.set(c.id, c));
    return map;
  }, [filterableColumns]);

  const form = useForm<FormType>({
    resolver: zodResolver(formSchema),
    defaultValues: { rows: [] },
  });

  const { control, getValues, setValue, watch, reset, formState } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "rows",
  });

  /**
   * Hydrate form from external filters whenever the panel mounts
   * or filters change externally.
   */
  useEffect(() => {
    if (formState.isDirty) return;
    const nextRows = filtersToRows(filters ?? []);
    reset({ rows: nextRows });
  }, [filters, formState.isDirty, reset]);

  const applyFilters = useCallback(() => {
    const data = getValues();
    const rows = data.rows ?? [];

    const grouped = new Map<string, FilterObjType[]>();

    for (const r of rows) {
      if (!r?.columnId) continue;

      const trimmed = r.value?.trim();
      if (!trimmed) continue;

      const op = r.operation;
      if (!op?.label || !op?.value) continue;

      const isAllowed = OPERATIONS_LIST.some((o) => o.value === op.value);
      if (!isAllowed) continue;

      const list = grouped.get(r.columnId) ?? [];

      const linkForThisClause: LinkValue | null =
        list.length === 0 ? null : normalizeLink(r.link ?? "AND");

      list.push({
        operation: op as FilterObjType["operation"],
        value: trimmed,
        link: linkForThisClause,
      });

      grouped.set(r.columnId, list);
    }

    const next = Array.from(grouped.entries()).map(([id, value]) => ({
      id,
      value,
    })) as DataExplorerColumnFilter[];

    table.setColumnFilters(next);
    setFilters(next);
  }, [getValues, setFilters, table]);

  const addRow = () => {
    const prev = fields[fields.length - 1];
    const prevColumnId = prev
      ? getValues(`rows.${fields.length - 1}.columnId`)
      : null;

    const first = filterableColumns[0];
    if (!first) return;

    const nextColumnId = prevColumnId ?? first.id;
    const col = columnsById.get(nextColumnId);
    const type = col?.columnDef.meta?.type as string | undefined;

    append({
      link: fields.length === 0 ? null : "AND",
      columnId: nextColumnId,
      operation: defaultOpForType(type),
      value: "",
    });
  };
  

  return (
    <div className="space-y-3 ">
      <span className="block font-medium">Filters</span>

      {fields.length > 0 && (
        <div className="  overflow-auto divide-y divide-y-gray-200">
          {fields.map((row, index) => {
            const rows = watch("rows") ?? [];
            const currentColumnId = rows[index]?.columnId;

            const hasPriorSameColumn =
              index > 0 &&
              Boolean(currentColumnId) &&
              rows.slice(0, index).some((r) => r?.columnId === currentColumnId);

            const col = currentColumnId
              ? columnsById.get(currentColumnId)
              : undefined;
            const isTimestamp = col?.columnDef.meta?.type === "timestamp";
            const valueInputType =
              col?.columnDef.meta?.type === "numeric" ? "number" : "text";

            return (
              <div key={row.id} className="py-2 first:pt-0">
                <div className="flex items-center gap-2">
                  <div className="w-full space-y-2">
                    <div className="flex items-center gap-2">
                      {/* Link (AND/OR) - only when this column appeared earlier anywhere */}
                      {hasPriorSameColumn && (
                        <Controller
                          control={control}
                          name={`rows.${index}.link`}
                          render={({ field }) => (
                            <Select
                              value={(field.value ?? "AND") as LinkValue}
                              onValueChange={(next) => {
                                field.onChange(next as LinkValue);
                                applyFilters();
                              }}
                            >
                              <SelectTrigger
                                className="h-9 min-w-[55px] text-xs text-center"
                               
                              >
                                <SelectValue placeholder="AND" />
                                <SelectIcon className="hidden" />
                              </SelectTrigger>
                              <SelectContent>
                                {LINK_OPTIONS.map((o) => (
                                  <SelectItem key={o.value} value={o.value}>
                                    {o.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      )}

                      {/* Field */}
                      <Controller
                        control={control}
                        name={`rows.${index}.columnId`}
                        render={({ field }) => (
                          <Select
                            value={field.value}
                            onValueChange={(next) => {
                              field.onChange(next);

                              const allRows = getValues("rows") ?? [];
                              const isFirstForThisColumn =
                                index === 0 ||
                                !allRows
                                  .slice(0, index)
                                  .some((r) => r?.columnId === next);

                              setValue(
                                `rows.${index}.link`,
                                isFirstForThisColumn ? null : "AND",
                                { shouldDirty: true, shouldTouch: true },
                              );

                              const nextCol = columnsById.get(next);
                              const type = nextCol?.columnDef.meta?.type as
                                | string
                                | undefined;

                              setValue(
                                `rows.${index}.operation`,
                                defaultOpForType(type),
                                { shouldDirty: true, shouldTouch: true },
                              );

                              setValue(`rows.${index}.value`, "", {
                                shouldDirty: true,
                                shouldTouch: true,
                              });

                              applyFilters();
                            }}
                          >
                            <div className="w-full">
                              <SelectTrigger className="h-9 w-full">
                                <SelectValue
                                  placeholder="Field"
                                  className="truncate block"
                                />
                              </SelectTrigger>
                              <SelectContent>
                                {filterableColumns.map((c) => {
                                  const label =
                                    (c.columnDef.header as string) ?? c.id;
                                  return (
                                    <SelectItem key={c.id} value={c.id}>
                                      {String(label)}
                                    </SelectItem>
                                  );
                                })}
                              </SelectContent>
                            </div>
                          </Select>
                        )}
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Operation */}
                      <Controller
                        control={control}
                        name={`rows.${index}.operation.value`}
                        render={({ field }) => {
                          const allowedOps = operationsForType(
                            col?.columnDef.meta?.type as string | undefined,
                          );

                          return (
                            <Select
                              value={field.value}
                              onValueChange={(val) => {
                                const op = allowedOps.find(
                                  (o) => o.value === val,
                                );
                                if (!op) return;

                                setValue(`rows.${index}.operation`, op, {
                                  shouldDirty: true,
                                  shouldTouch: true,
                                });

                                applyFilters();
                              }}
                            >
                              <Tooltip
                                content={
                                  OPERATIONS_LIST.find(
                                    (o) => o.value === field.value,
                                  )?.label ?? field.value
                                }
                              >
                                <SelectTrigger
                                  className="h-9 min-w-[55px] text-center"
                                  
                                >
                                  <SelectValue placeholder="Operation">
                                    <span className="truncate font-medium">
                                      {field.value || "Operation"}
                                    </span>
                                  </SelectValue>
                                </SelectTrigger>
                              </Tooltip>

                              <SelectContent>
                                {allowedOps.map((o) => (
                                  <SelectItem key={o.value} value={o.value}>
                                    {o.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          );
                        }}
                      />

                      {/* Value*/}
                      <Controller
                        control={control}
                        name={`rows.${index}.value`}
                        render={({ field }) =>
                          isTimestamp ? (
                            <DatePicker
                              date={field.value}
                              setDate={(next) => {
                                field.onChange(next);
                                applyFilters();
                                return false;
                              }}
                            />
                          ) : (
                            <Input
                              className="h-9"
                              placeholder="Value"
                              value={field.value ?? ""}
                              type={valueInputType}
                              onChange={(e) => field.onChange(e.target.value)}
                              onBlur={() => applyFilters()}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  applyFilters();
                                  return false;
                                }
                              }}
                            />
                          )
                        }
                      />
                    </div>
                  </div>

                  {/* Remove */}
                  <Tooltip content="Remove filter">
                    <Button
                      type="button"
                      variant="link"
                      size="sm"
                      className="p-0 cursor-pointer text-gray-600 hover:text-black"
                      onClick={() => {
                        remove(index);
                        applyFilters();
                      }}
                      aria-label="Remove filter row"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </Tooltip>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Button
        type="button"
        className="cursor-pointer"
        variant="outline"
        onClick={addRow}
        data-cy="filters-add-button"
      >
        <PlusCircleIcon /> Add filter
      </Button>
    </div>
  );
}
