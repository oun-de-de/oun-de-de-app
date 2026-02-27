import type { ColumnDef } from "@tanstack/react-table";
import type { Installment } from "@/core/types/loan";
import { Badge } from "@/core/ui/badge";
import { Button } from "@/core/ui/button";

type InstallmentsColumnsOptions = {
	isPayPending?: boolean;
	onSelectInstallment?: (installment: Installment) => void;
};

function isPayableStatus(status: Installment["status"]) {
	const normalizedStatus = status.toLowerCase();
	return normalizedStatus === "unpaid" || normalizedStatus === "overdue";
}

export function getInstallmentsColumns({
	isPayPending = false,
	onSelectInstallment,
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
			cell: ({ row }) => new Date(row.original.dueDate).toLocaleDateString(),
		},
		{
			accessorKey: "amount",
			header: "Amount",
			cell: ({ row }) => row.original.amount.toLocaleString(),
			meta: { bodyClassName: "text-right" },
		},
		{
			accessorKey: "status",
			header: "Status",
			size: 100,
			cell: ({ row }) => {
				const normalizedStatus = row.original.status.toLowerCase();
				return (
					<Badge variant={normalizedStatus === "paid" ? "success" : "destructive"}>
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
			cell: ({ row }) => (row.original.paidAt ? new Date(row.original.paidAt).toLocaleDateString() : "-"),
		},
		{
			id: "action",
			header: "Action",
			size: 100,
			cell: ({ row }) => {
				if (!isPayableStatus(row.original.status) || !onSelectInstallment) return null;
				return (
					<Button
						variant="outline"
						size="sm"
						onClick={() => onSelectInstallment(row.original)}
						disabled={isPayPending}
					>
						{isPayPending ? "..." : "Pay"}
					</Button>
				);
			},
			meta: { bodyClassName: "text-center" },
		},
	];
}
