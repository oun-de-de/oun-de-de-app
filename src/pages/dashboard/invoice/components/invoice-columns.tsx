import type { ColumnDef } from "@tanstack/react-table";
import type { Invoice } from "@/core/types/invoice";
import { Badge } from "@/core/ui/badge";
import { Button } from "@/core/ui/button";
import { Checkbox } from "@/core/ui/checkbox";
import { getInvoiceTypeVariant } from "@/core/utils/get-status-variant";
import { formatDisplayDateTime } from "../utils/formatters";

type InvoiceColumnsOptions = {
	allSelected: boolean;
	partiallySelected: boolean;
	selectedIds: Set<string>;
	onToggleAll: (checked: boolean) => void;
	onToggleOne: (id: string, checked: boolean) => void;
	onEditOne: (invoice: Invoice) => void;
};

export function getInvoiceColumns({
	allSelected,
	partiallySelected,
	selectedIds,
	onToggleAll,
	onToggleOne,
	onEditOne,
}: InvoiceColumnsOptions): ColumnDef<Invoice>[] {
	return [
		{
			id: "select",
			size: 48,
			meta: { bodyClassName: "text-center", headerClassName: "print:hidden", cellClassName: "print:hidden" },
			header: () => (
				<div className="print:hidden">
					<Checkbox
						checked={allSelected ? true : partiallySelected ? "indeterminate" : false}
						onCheckedChange={(checked) => onToggleAll(checked === true)}
						aria-label="Select all invoices"
					/>
				</div>
			),
			cell: ({ row }) => (
				<div className="print:hidden">
					<Checkbox
						checked={selectedIds.has(row.original.id)}
						onCheckedChange={(checked) => onToggleOne(row.original.id, checked === true)}
						aria-label={`Select invoice ${row.original.refNo}`}
					/>
				</div>
			),
		},
		{
			header: "Invoice No",
			accessorKey: "refNo",
			size: 120,
			cell: ({ row }) => <span className="font-medium text-sky-600">{row.original.refNo}</span>,
		},
		{
			header: "Date",
			accessorKey: "date",
			size: 130,
			cell: ({ row }) => formatDisplayDateTime(row.original.date),
			meta: { bodyClassName: "text-center" },
		},
		{
			header: "Customer",
			accessorKey: "customerName",
		},
		{
			header: "Type",
			size: 80,
			accessorKey: "type",
			cell: ({ row }) => <Badge variant={getInvoiceTypeVariant(row.original.type)}>{row.original.type}</Badge>,
			meta: { bodyClassName: "text-center capitalize" },
		},
		{
			header: "Actions",
			id: "actions",
			size: 80,
			meta: { bodyClassName: "text-center", headerClassName: "print:hidden", cellClassName: "print:hidden" },
			cell: ({ row }) => (
				<Button
					variant="secondary"
					size="sm"
					className="h-7 px-2 text-xs print:hidden"
					onClick={() => onEditOne(row.original)}
				>
					Edit
				</Button>
			),
		},
	];
}
