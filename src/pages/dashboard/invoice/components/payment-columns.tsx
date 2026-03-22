import type { ColumnDef } from "@tanstack/react-table";
import type { CyclePayment } from "@/core/types/cycle";
import { Button } from "@/core/ui/button";
import { formatDisplayDateTime, formatKHR } from "../utils/formatters";

type PaymentColumnsOptions = {
	onExportReceipt?: (payment: CyclePayment) => void;
	exportingPaymentId?: string | null;
};

export function getPaymentColumns({
	onExportReceipt,
	exportingPaymentId,
}: PaymentColumnsOptions = {}): ColumnDef<CyclePayment>[] {
	const columns: ColumnDef<CyclePayment>[] = [
		{
			accessorKey: "paymentDate",
			header: "Date",
			cell: ({ row }) => formatDisplayDateTime(row.original.paymentDate),
		},
		{
			accessorKey: "code",
			header: "Payment Code",
			cell: ({ row }) => row.original.code || "-",
		},
		{
			accessorKey: "amount",
			header: "Amount",
			cell: ({ row }) => formatKHR(row.original.amount),
			meta: { bodyClassName: "text-right" },
		},
	];

	if (onExportReceipt) {
		columns.push({
			id: "actions",
			header: "Actions",
			meta: { bodyClassName: "text-center" },
			cell: ({ row }) => (
				<Button
					variant="secondary"
					size="sm"
					className="h-7 px-2 text-xs"
					disabled={exportingPaymentId === row.original.id}
					onClick={(event) => {
						event.stopPropagation();
						onExportReceipt(row.original);
					}}
				>
					{exportingPaymentId === row.original.id ? "Loading..." : "Export Receipt"}
				</Button>
			),
		});
	}

	return columns;
}
