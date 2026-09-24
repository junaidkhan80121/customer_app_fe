import { Box, TableContainer } from '@mui/material';
import { ReactNode } from 'react';

/** Horizontally scrollable table wrapper for small screens */
export default function ResponsiveTable({ children }: { children: ReactNode }) {
  return (
    <TableContainer
      component={Box}
      sx={{
        width: '100%',
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
        '& .MuiTable-root': { minWidth: 640 },
      }}
    >
      {children}
    </TableContainer>
  );
}
