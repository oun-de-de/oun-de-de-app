import type { ColumnDef } from "@tanstack/react-table";
import type { Installment } from "@/core/types/loan";
import { Badge } from "@/core/ui/badge";
import { Button } from "@/core/ui/button";
import { formatDisplayDate, formatKHR } from "@/core/utils/formatters";

type InstallmentsColumnsOptions = {
	isPayPending?: boolean;
	isPostponePending?: boolean;
	onSelectInstallment?: (installment: Installment) => void;
	onPostpone?: () => void;
	allowPayInstallmentId?: string;
};

function isPayableStatus(status: Installment["status"]) {
	const normalizedStatus = status.toLowerCase();
	return normalizedStatus === "unpaid" || normalizedStatus === "overdue";
}

export function getInstallmentsColumns({
	isPayPending = false,
	isPostponePending = false,
	onSelectInstallment,
	onPostpone,
	allowPayInstallmentId,
}: InstallmentsColumnsOptions = {}): ColumnDef<Installment>[] {
	return [
		{
			accessorKey: "monthIndex",
			header: "No",
			size: 70,
			cell: ({ row }) => <span className="font-mono">{row.original.monthIndex}</span>,
			meta: { bodyClassName: "text-center" },
		},
		{
			accessorKey: "dueDate",
			header: "Due Date",
			cell: ({ row }) => formatDisplayDate(row.original.dueDate),
		},
		{
			accessorKey: "amount",
			header: "Amount",
			cell: ({ row }) => formatKHR(row.original.amount),
			meta: { bodyClassName: "text-right" },
		},
		{
			accessorKey: "status",
			header: "Status",
			size: 100,
			cell: ({ row }) => {
				const normalizedStatus = row.original.status.toLowerCase();
				return (
					<Badge
						variant={
							normalizedStatus === "paid" ? "success" : normalizedStatus === "overdue" ? "destructive" : "warning"
						}
					>
						{normalizedStatus.toUpperCase()}
					</Badge>
				);
			},
			meta: { bodyClassName: "text-center" },
		},
		{
			accessorKey: "paidAt",
			header: "Paid At",
			size: 120,
			cell: ({ row }) => formatDisplayDate(row.original.paidAt),
		},
		{
			id: "action",
			header: "Action",
			size: 160,
			cell: ({ row }) => {
				if (!isPayableStatus(row.original.status)) return null;
				const isPayableByOrder = !allowPayInstallmentId || allowPayInstallmentId === row.original.id;
				return (
					<div className="flex gap-1">
						{onSelectInstallment && (
							<Button
								variant="default"
								size="sm"
								onClick={() => onSelectInstallment(row.original)}
								disabled={isPayPending || isPostponePending || !isPayableByOrder}
								title={isPayableByOrder ? undefined : "Please pay earlier installment first"}
							>
								{isPayPending ? "..." : "Pay"}
							</Button>
						)}
						{onPostpone && isPayableByOrder && (
							<Button variant="warning" size="sm" onClick={onPostpone} disabled={isPayPending || isPostponePending}>
								{isPostponePending ? "..." : "Postpone"}
							</Button>
						)}
					</div>
				);
			},
			meta: { bodyClassName: "text-center" },
		},
	];
}
