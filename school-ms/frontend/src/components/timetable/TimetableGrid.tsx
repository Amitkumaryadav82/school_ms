import React from 'react';
import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

export interface GridCell {
  subject?: string;
  teacher?: string;
  locked?: boolean;
}

export interface TimetableGridProps {
  days: string[]; // headers for days
  periods: number; // number of periods per day
  data: Record<number, Record<number, GridCell>>; // dayIdx -> periodNo -> cell
}

const TimetableGrid: React.FC<TimetableGridProps> = ({ days, periods, data }) => {
  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Period</TableCell>
            {days.map((d) => (
              <TableCell key={d}>{d}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {Array.from({ length: periods }, (_, i) => i + 1).map((p) => (
            <TableRow key={p}>
              <TableCell sx={{ fontWeight: 600 }}>{p}</TableCell>
              {days.map((_, dayIdx) => {
                const cell = data[dayIdx]?.[p] || {};
                return (
                  <TableCell key={`${dayIdx}-${p}`} sx={{ whiteSpace: 'nowrap' }}>
                    <Box sx={{ fontWeight: 600 }}>{cell.subject || '-'}</Box>
                    <Box sx={{ color: 'text.secondary', fontSize: 12 }}>{cell.teacher || ''}</Box>
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TimetableGrid;
