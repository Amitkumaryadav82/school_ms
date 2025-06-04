import React, { useState } from 'react';
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
import { FeeStructure } from '../../services/feeService';

interface FeeStructureTableProps {
  feeStructures: FeeStructure[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onRefresh: () => void;
}

const FeeStructureTable: React.FC<FeeStructureTableProps> = ({ 
  feeStructures, 
  onEdit, 
  onDelete, 
  onRefresh 
}) => {
  if (!feeStructures || feeStructures.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          No fee structures available.
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
        <Table stickyHeader aria-label="fee structures table">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Class Grade</TableCell>
              <TableCell>Annual Fees</TableCell>
              <TableCell>Building Fees</TableCell>
              <TableCell>Lab Fees</TableCell>
              <TableCell>Total Fees</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {feeStructures.map((feeStructure) => (
              <TableRow key={feeStructure.id}>                <TableCell>{feeStructure.id}</TableCell>
                <TableCell>{feeStructure.classGrade}</TableCell>
                <TableCell>₹{feeStructure.annualFees?.toFixed(2)}</TableCell>
                <TableCell>₹{feeStructure.buildingFees?.toFixed(2)}</TableCell>
                <TableCell>₹{feeStructure.labFees?.toFixed(2)}</TableCell>
                <TableCell>₹{feeStructure.totalFees?.toFixed(2)}</TableCell>
                <TableCell>
                  <Tooltip title="Edit">
                    <IconButton 
                      size="small" 
                      onClick={() => feeStructure.id && onEdit(feeStructure.id)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton 
                      size="small"
                      onClick={() => feeStructure.id && onDelete(feeStructure.id)}
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

export default FeeStructureTable;
