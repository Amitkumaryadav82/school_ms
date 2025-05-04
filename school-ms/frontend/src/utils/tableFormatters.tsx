import { Chip, Button } from '@mui/material';
import { Column } from '../components/DataTable';

export const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString();
};

export const formatDateTime = (date: string) => {
  return new Date(date).toLocaleString();
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const formatStatus = (status: string) => {
  const colors: { [key: string]: 'success' | 'error' | 'warning' | 'info' } = {
    ACTIVE: 'success',
    INACTIVE: 'error',
    PENDING: 'warning',
    APPROVED: 'success',
    REJECTED: 'error',
    COMPLETED: 'success',
    IN_PROGRESS: 'info',
    PRESENT: 'success',
    ABSENT: 'error',
    LATE: 'warning',
    EXCUSED: 'info',
  };

  return (
    <Chip
      label={status}
      color={colors[status] || 'default'}
      size="small"
    />
  );
};

export const createActionColumn = <T extends { id?: number | string }>(
  onEdit?: (row: T) => void,
  onDelete?: (row: T) => void,
  additionalActions?: (row: T) => React.ReactNode
): Column<T> => ({
  id: 'actions',
  label: 'Actions',
  format: (_, row) => (
    <div style={{ display: 'flex', gap: '8px' }}>
      {onEdit && (
        <Button
          size="small"
          variant="outlined"
          color="primary"
          onClick={() => onEdit(row)}
        >
          Edit
        </Button>
      )}
      {onDelete && (
        <Button
          size="small"
          variant="outlined"
          color="error"
          onClick={() => onDelete(row)}
        >
          Delete
        </Button>
      )}
      {additionalActions && additionalActions(row)}
    </div>
  ),
});