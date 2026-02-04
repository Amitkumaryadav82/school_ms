import React from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  IconButton,
  Typography
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { TransportRoute } from '../../services/feeService';

interface TransportRouteTableProps {
  transportRoutes: TransportRoute[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onRefresh: () => void;
}

const TransportRouteTable: React.FC<TransportRouteTableProps> = ({
  transportRoutes,
  onEdit,
  onDelete,
  onRefresh
}) => {
  if (!transportRoutes || transportRoutes.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          No transport routes available.
        </Typography>
        <IconButton onClick={onRefresh} sx={{ mt: 1 }} color="primary">
          <RefreshIcon />
        </IconButton>
      </Box>
    );
  }

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
        <Tooltip title="Refresh">
          <IconButton onClick={onRefresh}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader aria-label="transport routes table">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Route Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Fee Amount</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transportRoutes.map((route) => (
              <TableRow key={route.id}>
                <TableCell>{route.id}</TableCell>
                <TableCell>{route.routeName}</TableCell>
                <TableCell>{route.routeDescription}</TableCell>
                <TableCell>₹{route.feeAmount?.toFixed(2)}</TableCell>
                <TableCell>
                  <Tooltip title="Edit">
                    <IconButton
                      size="small"
                      onClick={() => route.id && onEdit(route.id)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                      size="small"
                      onClick={() => route.id && onDelete(route.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default TransportRouteTable;
