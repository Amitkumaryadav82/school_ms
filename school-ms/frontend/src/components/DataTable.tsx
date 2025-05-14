import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Box,
  TextField,
  TableSortLabel,
  IconButton,
  Tooltip,
  CircularProgress,
  Typography,
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

export interface Column<T> {
  id: string;
  label: string;
  sortable?: boolean;
  format?: (value: any, row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  defaultRowsPerPage?: number;
  rowsPerPageOptions?: number[];
  loading?: boolean;
  onRefresh?: () => void;
  searchEnabled?: boolean;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  initialSortBy?: string;
  renderRowDetail?: (row: T) => React.ReactNode;
  expandableRows?: boolean;
}

function DataTable<T extends { [key: string]: any }>({
  columns,
  data,
  defaultRowsPerPage = 10,
  rowsPerPageOptions = [5, 10, 25, 50],
  loading = false,
  onRefresh,
  searchEnabled = true,
  searchPlaceholder = 'Search...',
  onSearch,
  initialSortBy,
  renderRowDetail,
  expandableRows = false,
}: DataTableProps<T>) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<string | null>(initialSortBy || null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [expandedRows, setExpandedRows] = useState<Record<string | number, boolean>>({});

  useEffect(() => {
    setPage(0);
  }, [searchQuery]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSort = (columnId: string) => {
    const isAsc = sortBy === columnId && sortDirection === 'asc';
    setSortDirection(isAsc ? 'desc' : 'asc');
    setSortBy(columnId);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query);
    onSearch?.(query);
  };

  const toggleRowExpand = (rowId: string | number) => {
    setExpandedRows(prev => ({
      ...prev,
      [rowId]: !prev[rowId]
    }));
  };

  const filteredData = data.filter((row) =>
    Object.values(row).some((value) =>
      String(value).toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const sortedData = sortBy
    ? [...filteredData].sort((a, b) => {
        const aValue = a[sortBy];
        const bValue = b[sortBy];
        
        if (aValue === bValue) return 0;
        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;

        const comparison = aValue < bValue ? -1 : 1;
        return sortDirection === 'asc' ? comparison : -comparison;
      })
    : filteredData;

  const paginatedData = sortedData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      {(searchEnabled || onRefresh) && (
        <Box sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
          {searchEnabled && (
            <TextField
              size="small"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={handleSearch}
              sx={{ minWidth: 300 }}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          )}
          {onRefresh && (
            <Tooltip title="Refresh data">
              <IconButton onClick={onRefresh} disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      )}

      <TableContainer>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  sortDirection={sortBy === column.id ? sortDirection : false}
                >
                  {column.sortable ? (
                    <TableSortLabel
                      active={sortBy === column.id}
                      direction={sortBy === column.id ? sortDirection : 'asc'}
                      onClick={() => handleSort(column.id)}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 4 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    No data found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, index) => (
                <React.Fragment key={index}>
                  <TableRow hover>
                    {columns.map((column) => (
                      <TableCell key={column.id}>
                        {column.format
                          ? column.format(row[column.id], row)
                          : row[column.id]}
                      </TableCell>
                    ))}
                    {expandableRows && renderRowDetail && (
                      <TableCell>
                        <IconButton onClick={() => toggleRowExpand(row.id)}>
                          {expandedRows[row.id] ? '-' : '+'}
                        </IconButton>
                      </TableCell>
                    )}
                  </TableRow>
                  {expandableRows && renderRowDetail && expandedRows[row.id] && (
                    <TableRow>
                      <TableCell colSpan={columns.length}>
                        {renderRowDetail(row)}
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={rowsPerPageOptions}
        component="div"
        count={sortedData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
}

export default DataTable;
