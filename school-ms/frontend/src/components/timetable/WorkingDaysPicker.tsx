import React from 'react';
import { FormGroup, FormControlLabel, Checkbox } from '@mui/material';

// bits: Mon..Sun -> 1..7
const labels = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

export interface WorkingDaysPickerProps {
  mask: number;
  onChange: (newMask: number) => void;
}

const WorkingDaysPicker: React.FC<WorkingDaysPickerProps> = ({ mask, onChange }) => {
  const toggle = (idx: number) => {
    const bit = 1 << idx;
    const next = (mask & bit) ? (mask & ~bit) : (mask | bit);
    onChange(next);
  };
  return (
    <FormGroup row>
      {labels.map((lbl, idx) => (
        <FormControlLabel
          key={lbl}
          control={<Checkbox checked={!!(mask & (1 << idx))} onChange={() => toggle(idx)} />}
          label={lbl}
        />
      ))}
    </FormGroup>
  );
};

export default WorkingDaysPicker;
