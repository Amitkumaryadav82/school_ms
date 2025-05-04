import React from 'react';
export interface Column<T> {
    id: keyof T | 'actions';
    label: string;
    minWidth?: number;
    sortable?: boolean;
    filterable?: boolean;
    format?: (value: any) => React.ReactNode;
    filterOptions?: string[];
}
interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    rowsPerPageOptions?: number[];
    defaultRowsPerPage?: number;
}
declare const DataTable: <T extends {
    id?: number | string;
}>({ columns, data, rowsPerPageOptions, defaultRowsPerPage, }: DataTableProps<T>) => React.JSX.Element;
export default DataTable;
