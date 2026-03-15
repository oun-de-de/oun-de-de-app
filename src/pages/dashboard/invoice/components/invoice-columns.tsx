import type { ColumnDef } from "@tanstack/react-table";
import type { Invoice } from "@/core/types/invoice";
import { Button } from "@/core/ui/button";
import { Checkbox } from "@/core/ui/checkbox";
import { formatDisplayDateTime } from "../utils/formatters";

type InvoiceColumnsOptions = {
	allSelected: boolean;
	partiallySelected: boolean;
	selectedIds: Set<string>;
	onToggleAll: (checked: boolean) => void;
	onToggleOne: (id: string, checked: boolean) => void;
	onEditOne: (invoice: Invoice) => void;
	onPrintA5One: (invoice: Invoice) => void;
};

export function getInvoiceColumns({
	allSelected,
	partiallySelected,
	selectedIds,
	onToggleAll,
	onToggleOne,
	onEditOne,
	onPrintA5One,
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
						onClick={(event) => event.stopPropagation()}
						onCheckedChange={(checked) => onToggleAll(checked === true)}
						aria-label="Select all invoices"
					/>
				</div>
			),
			cell: ({ row }) => (
				<div className="print:hidden">
					<Checkbox
						checked={selectedIds.has(row.original.id)}
						onClick={(event) => event.stopPropagation()}
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
			header: "Actions",
			id: "actions",
			size: 170,
			meta: { bodyClassName: "text-center", headerClassName: "print:hidden", cellClassName: "print:hidden" },
			cell: ({ row }) => (
				<div className="flex items-center justify-center gap-2 print:hidden">
					<Button
						variant="warning"
						size="sm"
						className="h-7 px-2 text-xs"
						onClick={(event) => {
							event.stopPropagation();
							onEditOne(row.original);
						}}
					>
						Edit
					</Button>
					<Button
						variant="info"
						size="sm"
						className="h-7 px-2 text-xs"
						onClick={(event) => {
							event.stopPropagation();
							onPrintA5One(row.original);
						}}
					>
						Print A5
					</Button>
				</div>
			),
		},
	];
}
