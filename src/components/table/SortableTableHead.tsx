import { TableCell, TableHead, TableRow, TableSortLabel } from '@mui/material';

export type SortOrder = 'asc' | 'desc';

export type SortableColumn<T extends string = string> = {
  id: T;
  label: string;
  align?: 'left' | 'right' | 'center';
  /** default true; set false for actions / rank columns */
  sortable?: boolean;
};

type Props<T extends string> = {
  columns: SortableColumn<T>[];
  orderBy: T;
  order: SortOrder;
  onRequestSort: (column: T) => void;
};

export default function SortableTableHead<T extends string>({
  columns,
  orderBy,
  order,
  onRequestSort,
}: Props<T>) {
  return (
    <TableHead>
      <TableRow>
        {columns.map((col) => {
          const sortable = col.sortable !== false;
          return (
            <TableCell
              key={col.id}
              align={col.align}
              sortDirection={sortable && orderBy === col.id ? order : false}
            >
              {sortable ? (
                <TableSortLabel
                  active={orderBy === col.id}
                  direction={orderBy === col.id ? order : 'asc'}
                  onClick={() => onRequestSort(col.id)}
                >
                  {col.label}
                </TableSortLabel>
              ) : (
                col.label
              )}
            </TableCell>
          );
        })}
      </TableRow>
    </TableHead>
  );
}

/** Toggle helper shared by pages */
export function nextSortState<T extends string>(
  currentBy: T,
  currentOrder: SortOrder,
  column: T,
  defaultOrder: SortOrder = 'asc',
): { orderBy: T; order: SortOrder } {
  if (currentBy === column) {
    return { orderBy: column, order: currentOrder === 'asc' ? 'desc' : 'asc' };
  }
  return { orderBy: column, order: defaultOrder };
}

export function compareValues(a: unknown, b: unknown, order: SortOrder): number {
  const dir = order === 'asc' ? 1 : -1;
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (typeof a === 'number' && typeof b === 'number') return (a - b) * dir;
  if (typeof a === 'boolean' && typeof b === 'boolean') return (Number(a) - Number(b)) * dir;
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' }) * dir;
}
