import {
    Refresh as RefreshIcon,
    Search as SearchIcon,
} from '@mui/icons-material';
import {
    Box,
    CircularProgress,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    TableSortLabel,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';

/**
 * Generic column definition for BaseTable
 */
export interface BaseTableColumn<T> {
  /** Property name in data object or 'actions' for action column */
  id: keyof T | string;
  /** Column header text */
  label: string;
  /** Whether the column can be sorted */
  sortable?: boolean;
  /** Custom formatter for cell value */
  format?: (value: any, row: T) => React.ReactNode;
  /** Minimum width of the column */
  minWidth?: number;
  /** Alignment of the column */
  align?: 'left' | 'right' | 'center';
  /** Whether the column can be hidden */
  hideable?: boolean;
}

/**
 * Props for BaseTable component
 */
interface BaseTableProps<T> {
  /** Column definitions */
  columns: BaseTableColumn<T>[];
  /** Data to display */
  data: T[];
  /** Default number of rows per page */
  defaultRowsPerPage?: number;
  /** Available options for rows per page */
  rowsPerPageOptions?: number[];
  /** Whether data is loading */
  loading?: boolean;
  /** Callback when refresh button is clicked */
  onRefresh?: () => void;
  /** Whether search is enabled */
  searchEnabled?: boolean;
  /** Placeholder text for search field */
  searchPlaceholder?: string;
  /** Callback when search query changes */
  onSearch?: (query: string) => void;
  /** Default column to sort by */
  defaultSortBy?: string;
  /** Default sort direction */
  defaultSortDirection?: 'asc' | 'desc';
  /** Title for the table */
  title?: string;
  /** Whether to display a toolbar */
  showToolbar?: boolean;
  /** Custom toolbar content */
  toolbarContent?: React.ReactNode;
  /** Whether to show row hover effect */
  hover?: boolean;
  /** Whether to display a dense table */
  dense?: boolean;
  /** Custom empty state message */
  emptyMessage?: string;
  /** Key property in data objects for React keys */
  keyProperty?: keyof T;
  /** Whether table should take full height */
  fullHeight?: boolean;
}

/**
 * A base table component that can be extended for specific use cases
 */
function BaseTable<T extends Record<string, any>>({
  columns,
  data,
  defaultRowsPerPage = 10,
  rowsPerPageOptions = [5, 10, 25, 50],
  loading = false,
  onRefresh,
  searchEnabled = true,
  searchPlaceholder = 'Search...',
  onSearch,
  defaultSortBy = '',
  defaultSortDirection = 'asc',
  title,
  showToolbar = true,
  toolbarContent,
  hover = true,
  dense = false,
  emptyMessage = 'No data to display',
  keyProperty = 'id' as keyof T,
  fullHeight = false,
}: BaseTableProps<T>) {
  // State
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<string>(defaultSortBy);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(defaultSortDirection);

  // Filtering and sorting logic
  const filteredData = useCallback(() => {
    if (!searchQuery || !searchEnabled) {
      return data;
    }
    
    const query = searchQuery.toLowerCase();
    return data.filter(row => 
      columns.some(column => {
        const key = column.id as string;
        const value = row[key];
        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(query);
      })
    );
  }, [data, searchQuery, searchEnabled, columns]);

  const sortedData = useCallback(() => {
    if (!sortBy) return filteredData();
    
    return [...filteredData()].sort((a, b) => {
      const aValue = a[sortBy as keyof T];
      const bValue = b[sortBy as keyof T];
      
      if (aValue === bValue) return 0;
      
      // Handle different data types
      if (aValue === null || aValue === undefined) return sortDirection === 'asc' ? -1 : 1;
      if (bValue === null || bValue === undefined) return sortDirection === 'asc' ? 1 : -1;
      
      // String comparison
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      // Number or Date comparison
      return sortDirection === 'asc'
        ? (aValue < bValue ? -1 : 1)
        : (bValue < aValue ? -1 : 1);
    });
  }, [filteredData, sortBy, sortDirection]);

  const handleSort = (columnId: string) => {
    const isAsc = sortBy === columnId && sortDirection === 'asc';
    setSortDirection(isAsc ? 'desc' : 'asc');
    setSortBy(columnId);
  };

  // Pagination handlers
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Search handling
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query);
    setPage(0);
    if (onSearch) {
      onSearch(query);
    }
  };

  // Reset page when data changes
  useEffect(() => {
    setPage(0);
  }, [data.length]);

  // Calculate pagination
  const currentPageData = sortedData().slice(
    page * rowsPerPage,
    (page + 1) * rowsPerPage
  );

  // Render toolbar
  const renderToolbar = () => {
    if (!showToolbar) return null;
    
    return (
      <Box 
        sx={{ 
          p: 2, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1
        }}
      >
        {title && (
          <Typography variant="h6" component="div">
            {title}
          </Typography>
        )}
        
        <Box sx={{ display: 'flex', alignItems: 'center', ml: 'auto', gap: 1 }}>
          {searchEnabled && (
            <TextField
              size="small"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
              }}
              sx={{ width: { xs: '100%', sm: '12rem' } }}
            />
          )}
          
          {onRefresh && (
            <Tooltip title="Refresh">
              <IconButton onClick={onRefresh} size="small">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          )}
          
          {toolbarContent}
        </Box>
      </Box>
    );
  };

  // Render empty state
  const renderEmpty = () => {
    return (
      <TableRow>
        <TableCell colSpan={columns.length} align="center" sx={{ py: 6 }}>
          <Typography variant="body1" color="text.secondary">
            {emptyMessage}
          </Typography>
        </TableCell>
      </TableRow>
    );
  };

  // Render loading state
  const renderLoading = () => {
    return (
      <TableRow>
        <TableCell colSpan={columns.length} align="center" sx={{ py: 6 }}>
          <CircularProgress size={28} sx={{ mb: 2 }} />
          <Typography variant="body1" color="text.secondary" display="block">
            Loading data...
          </Typography>
        </TableCell>
      </TableRow>
    );
  };

  return (
    <Paper 
      sx={{ 
        width: '100%', 
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        height: fullHeight ? '100%' : 'auto'
      }}
    >
      {renderToolbar()}
      
      <TableContainer sx={{ flexGrow: 1 }}>
        <Table stickyHeader size={dense ? 'small' : 'medium'}>
          <TableHead>
            <TableRow>
              {columns.map(column => (
                <TableCell
                  key={column.id as string}
                  align={column.align || 'left'}
                  style={{ minWidth: column.minWidth }}
                >
                  {column.sortable ? (
                    <TableSortLabel
                      active={sortBy === column.id}
                      direction={sortBy === column.id ? sortDirection : 'asc'}
                      onClick={() => handleSort(column.id as string)}
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
              renderLoading()
            ) : currentPageData.length === 0 ? (
              renderEmpty()
            ) : (
              currentPageData.map((row, index) => (
                <TableRow 
                  hover={hover}
                  key={keyProperty && row[keyProperty] ? row[keyProperty] : index}
                >
                  {columns.map(column => {
                    const id = column.id as string;
                    const value = row[id];
                    
                    return (
                      <TableCell key={id} align={column.align || 'left'}>
                        {column.format ? column.format(value, row) : value}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      <TablePagination
        rowsPerPageOptions={rowsPerPageOptions}
        component="div"
        count={sortedData().length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
}

export default BaseTable;
