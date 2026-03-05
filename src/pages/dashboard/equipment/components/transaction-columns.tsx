import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/core/ui/badge";
import { Button } from "@/core/ui/button";
import { getExpenseText, type TransactionRow } from "../utils/transaction-columns-utils";

const REASON_BADGE_VARIANTS: Record<string, "info" | "warning" | "destructive" | "default"> = {
	purchase: "info",
	borrow: "warning",
	consume: "destructive",
	return: "info",
};

const PRINT_BUTTON_CLASS = "h-8 gap-1 px-2";
const TABLE_COLUMNS = {
	DATE: "date",
	TYPE: "type",
	REASON: "reason",
	QUANTITY: "quantity",
	EXPENSE: "expense",
	MEMO: "memo",
	ACTIONS: "actions",
} as const;

function getTypeBadgeVariant(type: string) {
	return type === "IN" ? "info" : "destructive";
}

function TypeBadgeCell({ typeValue }: { typeValue: string }) {
	return (
		<Badge variant={getTypeBadgeVariant(typeValue)} shape="square">
			{typeValue}
		</Badge>
	);
}

function ReasonBadgeCell({ reason }: { reason: string }) {
	return <Badge variant={REASON_BADGE_VARIANTS[reason.toLowerCase()] ?? "default"}>{reason}</Badge>;
}

function PrintActionCell({
	row,
	onPrintReport,
}: {
	row: TransactionRow;
	onPrintReport?: (row: TransactionRow) => void;
}) {
	if (!onPrintReport) return null;
	return (
		<Button
			variant="default"
			size="sm"
			type="button"
			className={PRINT_BUTTON_CLASS}
			onClick={(e) => {
				e.preventDefault();
				e.stopPropagation();
				onPrintReport(row);
			}}
		>
			Print
		</Button>
	);
}

type TransactionColumnsOptions = {
	onPrintReport?: (row: TransactionRow) => void;
};

export function transactionColumns({ onPrintReport }: TransactionColumnsOptions = {}): ColumnDef<TransactionRow>[] {
	return [
		{ accessorKey: TABLE_COLUMNS.DATE, header: "Date" },
		{
			accessorKey: TABLE_COLUMNS.TYPE,
			header: "Type",
			size: 80,
			cell: ({ row }) => <TypeBadgeCell typeValue={row.original.type} />,
			meta: {
				bodyClassName: "text-center",
			},
		},
		{
			accessorKey: TABLE_COLUMNS.REASON,
			header: "Reason",
			cell: ({ row }) => <ReasonBadgeCell reason={row.original.reason} />,
		},
		{ accessorKey: TABLE_COLUMNS.QUANTITY, header: "Quantity", meta: { bodyClassName: "text-right" } },
		{
			accessorKey: TABLE_COLUMNS.EXPENSE,
			header: "Expense",
			cell: ({ row }) => getExpenseText(row.original.expense),
			meta: { bodyClassName: "text-right" },
		},
		{ accessorKey: TABLE_COLUMNS.MEMO, header: "Memo" },
		{
			id: TABLE_COLUMNS.ACTIONS,
			header: "Actions",
			cell: ({ row }) => <PrintActionCell row={row.original} onPrintReport={onPrintReport} />,
			meta: { bodyClassName: "text-center" },
		},
	];
}
