"use client";

import React, {
  createContext,
  Dispatch,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Papa from "papaparse";
import { isValidDate } from "./utils";

export type SortConfig =
  | {
      key: string;
      direction: "asc" | "desc";
    }
  | null;

export type RowData = Record<string, unknown>;
export type FilterValue =
  | string
  | number[]
  | [string | null, string | null]
  | null;
export type Filters = Record<string, FilterValue>;

export type SetTableData = (stringData: string) => void;
export type UpdateFilter = (key: string, value: FilterValue) => void;
export type HandleGlobalFilterChange = (value: string) => void;
export type ToggleColumn = (column: string) => void;

export interface DataStateContextProps {
  dataUrl: string;
  data: RowData[];
  isLoading: boolean;
  filteredData: RowData[];
  filters: Filters;
  pinnedColumns: string[];
  visibleColumns: string[];
  currentPage: number;
  globalFilter: string;
  sortConfig: SortConfig;
  isSettingsDropdownOpen: boolean;
  columns: string[];
  paginatedData: RowData[];
  totalPages: number;
  rowsPerPage: number;

  handleGlobalFilterChange: HandleGlobalFilterChange;
  toggleSettingsDropdown: () => void;
  updateFilter: UpdateFilter;
  toggleColumnVisibility: ToggleColumn;
  togglePinColumn: ToggleColumn;
  setTableData: SetTableData;
  setCurrentPage: Dispatch<SetStateAction<number>>;
  setSortConfig: Dispatch<SetStateAction<SortConfig>>;
  setVisibleColumns: Dispatch<SetStateAction<string[]>>;
  setRowsPerPage: Dispatch<SetStateAction<number>>;
}

interface DataStateProviderProps {
  children: React.ReactNode;
  dataUrl: string;
}

export const DataStateContext = createContext<DataStateContextProps | null>(
  null
);

export const useResourceData = () => useContext(DataStateContext);

export const useResourceDataSafe = () => {
  const context = useContext(DataStateContext);
  if (!context) {
    throw new Error("useResourceData must be used within a DataStateProvider");
  }
  return context;
};

const parseData = (stringData: string): Papa.ParseResult<RowData> => {
  return Papa.parse<RowData>(stringData, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true,
  });
};

export const DataStateProvider = ({
  children,
  dataUrl,
}: DataStateProviderProps) => {
  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [data, setData] = useState<RowData[]>([]);
  const [filters, setFilters] = useState<Filters>({});
  const [pinnedColumns, setPinnedColumns] = useState<string[]>([]);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  const [isSettingsDropdownOpen, setIsSettingsDropdownOpen] =
    useState<boolean>(false);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  const setTableData: SetTableData = useCallback((stringData) => {
    const result = parseData(stringData);
    setData(result.data);
    setVisibleColumns(Object.keys(result.data[0] || {}));
    setCurrentPage(1);
  }, []);

  const handleGlobalFilterChange: HandleGlobalFilterChange = useCallback(
    (value) => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      debounceTimeoutRef.current = setTimeout(() => {
        setGlobalFilter(value);
        setCurrentPage(1);
      }, 300);
    },
    []
  );

  const toggleSettingsDropdown = useCallback(() => {
    setIsSettingsDropdownOpen((prev) => !prev);
  }, []);

  const updateFilter: UpdateFilter = useCallback((key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setCurrentPage(1);
  }, []);

  const toggleColumnVisibility: ToggleColumn = useCallback((column) => {
    setVisibleColumns((prev) =>
      prev.includes(column)
        ? prev.filter((col) => col !== column)
        : [...prev, column]
    );
  }, []);

  const togglePinColumn: ToggleColumn = useCallback((column) => {
    setPinnedColumns((prev) =>
      prev.includes(column)
        ? prev.filter((col) => col !== column)
        : [...prev, column]
    );
  }, []);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(dataUrl);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const csvText = await response.text();
      const parsedData = parseData(csvText);

      setData(parsedData.data);
      setVisibleColumns(Object.keys(parsedData.data[0] || {}));
      setCurrentPage(1);
    } catch (err) {
      console.error("Failed to fetch data for DataStateProvider:", err);
    } finally {
      setIsLoading(false);
    }
  }, [dataUrl]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const sortedData = useMemo(() => {
    if (!sortConfig) return data;

    const sorted = [...data];
    sorted.sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (aVal == null || bVal == null) return 0;

      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [data, sortConfig]);

  const filteredData = useMemo(() => {
    return sortedData.filter((row) => {
      if (
        globalFilter &&
        !Object.values(row).some((value) =>
          value?.toString().toLowerCase().includes(globalFilter.toLowerCase())
        )
      ) {
        return false;
      }

      return Object.entries(filters).every(([key, value]) => {
        const cellValue = row[key];
        if (!cellValue) return true;

        if (typeof value === "string") {
          return cellValue
            .toString()
            .toLowerCase()
            .includes(value.toLowerCase());
        }

        if (Array.isArray(value) && typeof cellValue === "number") {
          const [min, max] = value;

          if (min == null || max == null) return true;

          const minNum = typeof min === "string" ? parseFloat(min) : min;
          const maxNum = typeof max === "string" ? parseFloat(max) : max;

          if (isNaN(minNum) || isNaN(maxNum)) return true;

          return cellValue >= minNum && cellValue <= maxNum;
        }

        if (
          typeof cellValue === "string" &&
          isValidDate(cellValue) &&
          Array.isArray(value)
        ) {
          const [start, end] = value as [string | null, string | null];

          if (start && end) {
            const dateValue = new Date(cellValue).getTime();
            const oneMonthInMilliseconds =
              30.44 * 24 * 60 * 60 * 1000;

            return (
              dateValue >= new Date(start).getTime() &&
              dateValue <=
                new Date(end).getTime() + oneMonthInMilliseconds
            );
          }
        }

        return true;
      });
    });
  }, [sortedData, globalFilter, filters]);

  const paginatedData = useMemo(() => {
    return filteredData.slice(
      (currentPage - 1) * rowsPerPage,
      currentPage * rowsPerPage
    );
  }, [filteredData, currentPage, rowsPerPage]);

  const columns = useMemo(() => {
    const allColumns = Object.keys(data[0] || {});
    return [
      ...pinnedColumns,
      ...allColumns.filter((col) => !pinnedColumns.includes(col)),
    ];
  }, [data, pinnedColumns]);

  const totalPages = useMemo(
    () => Math.ceil(filteredData.length / rowsPerPage) || 1,
    [filteredData.length, rowsPerPage]
  );

  const value: DataStateContextProps = {
    dataUrl,
    data,
    isLoading,
    filteredData,
    filters,
    pinnedColumns,
    visibleColumns,
    currentPage,
    globalFilter,
    sortConfig,
    isSettingsDropdownOpen,
    columns,
    paginatedData,
    totalPages,
    rowsPerPage,
    setRowsPerPage,
    handleGlobalFilterChange,
    toggleSettingsDropdown,
    updateFilter,
    toggleColumnVisibility,
    togglePinColumn,
    setCurrentPage,
    setSortConfig,
    setVisibleColumns,
    setTableData,
  };

  return (
    <DataStateContext.Provider value={value}>
      {children}
    </DataStateContext.Provider>
  );
};
