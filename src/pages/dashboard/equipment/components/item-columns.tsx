import type { ColumnDef } from '@tanstack/react-table';
import { Menu } from 'lucide-react';
import type { InventoryItem } from '@/core/types/inventory';
import { Badge } from '@/core/ui/badge';
import { Button } from '@/core/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/core/ui/dropdown-menu';
import { formatKHR } from '@/core/utils/formatters';

export type ItemRow = {
  id: string;
  code: string;
  name: string;
  type: string;
  unit: string;
  supplier: string;
  unitPrice: number;
  quantityOnHand: number;
  alertThreshold: number;
};

type ItemRowActionHandlers = {
  onEdit: (itemId: string) => void;
  onUpdateStock: (itemId: string) => void;
  onBorrowings: (itemId: string) => void;
};

export function mapItemsToRows(items: InventoryItem[]): ItemRow[] {
  return items.map((item) => ({
    id: item.id,
    code: item.code,
    name: item.name,
    type: item.type,
    unit: item.unit?.name ?? '-',
    supplier: item.supplier?.name ?? '-',
    unitPrice: item.unitPrice ?? 0,
    quantityOnHand: item.quantityOnHand,
    alertThreshold: item.alertThreshold,
  }));
}

export function filterItemRows(
  rows: ItemRow[],
  typeFilter: string,
  fieldFilter: string,
  searchValue: string,
): ItemRow[] {
  const normalized = searchValue.trim().toLowerCase();
  return rows.filter((row) => {
    if (typeFilter !== 'all') {
      if (row.type.toLowerCase() !== typeFilter.toLowerCase()) return false;
    }

    if (!normalized) return true;

    if (fieldFilter === 'name')
      return row.name.toLowerCase().includes(normalized);
    if (fieldFilter === 'code')
      return row.code.toLowerCase().includes(normalized);
    if (fieldFilter === 'supplier')
      return row.supplier.toLowerCase().includes(normalized);

    return (
      row.name.toLowerCase().includes(normalized) ||
      row.code.toLowerCase().includes(normalized) ||
      row.supplier.toLowerCase().includes(normalized)
    );
  });
}

export function paginateItemRows(
  rows: ItemRow[],
  page: number,
  pageSize: number,
): {
  pagedRows: ItemRow[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
} {
  const totalItems = rows.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  return {
    pagedRows: rows.slice(start, start + pageSize),
    totalItems,
    totalPages,
    currentPage,
  };
}

export function itemColumns({
  onEdit,
  onUpdateStock,
  onBorrowings,
}: ItemRowActionHandlers): ColumnDef<ItemRow>[] {
  return [
    { accessorKey: 'code', header: 'Code' },
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'supplier', header: 'Supplier' },
    {
      accessorKey: 'unitPrice',
      header: 'Unit Price',
      cell: ({ row }) => formatKHR(row.original.unitPrice),
      meta: { bodyClassName: 'text-right' },
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => (
        <Badge
          variant={row.original.type === 'CONSUMABLE' ? 'info' : 'default'}
          className="w-4/5"
        >
          {row.original.type}
        </Badge>
      ),
      meta: {
        bodyClassName: 'text-center',
      },
    },
    {
      id: 'stockStatus',
      header: 'Status',
      cell: ({ row }) => {
        const isLowStock =
          row.original.quantityOnHand <= row.original.alertThreshold;
        return (
          <Badge variant={isLowStock ? 'warning' : 'success'}>
            {isLowStock ? 'LOW STOCK' : 'NORMAL'}
          </Badge>
        );
      },
      meta: {
        bodyClassName: 'text-center',
      },
    },
    { accessorKey: 'unit', header: 'Unit' },
    {
      accessorKey: 'quantityOnHand',
      header: 'On Hand',
      meta: { bodyClassName: 'text-right' },
    },
    {
      accessorKey: 'alertThreshold',
      header: 'Alert Threshold',
      cell: ({ row }) => row.original.alertThreshold ?? '-',
      meta: { bodyClassName: 'text-right' },
    },
    {
      id: 'actions',
      header: 'Actions',
      size: 96,
      cell: ({ row }) => (
        <div className="flex items-center justify-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" size="icon" variant="secondary">
                <Menu />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(event) => {
                  event.stopPropagation();
                  onEdit(row.original.id);
                }}
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(event) => {
                  event.stopPropagation();
                  onUpdateStock(row.original.id);
                }}
              >
                Update Stock
              </DropdownMenuItem>
              {row.original.type === 'EQUIPMENT' && (
                <DropdownMenuItem
                  onClick={(event) => {
                    event.stopPropagation();
                    onBorrowings(row.original.id);
                  }}
                >
                  Borrowings
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
      meta: { bodyClassName: 'text-center' },
    },
  ];
}
