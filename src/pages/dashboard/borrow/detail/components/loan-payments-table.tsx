import type { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { SmartDataTable } from "@/core/components/common";
import { Button } from "@/core/ui/button";
import { Text } from "@/core/ui/typography";
import { formatDisplayDateTime, formatKHR } from "@/core/utils/formatters";
import type { LoanPaymentRecord } from "../hooks/use-borrow-detail";

type LoanPaymentsTableProps = {
	payments: LoanPaymentRecord[];
	onExportReceipt?: (payment: LoanPaymentRecord) => void;
};

export function LoanPaymentsTable({ payments, onExportReceipt }: LoanPaymentsTableProps) {
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(20);
	const totalPages = useMemo(() => Math.max(1, Math.ceil(payments.length / pageSize)), [payments.length, pageSize]);
	const currentPage = Math.min(page, totalPages);
	const pagedPayments = useMemo(
		() => payments.slice((currentPage - 1) * pageSize, currentPage * pageSize),
		[payments, currentPage, pageSize],
	);

	const columns = useMemo<ColumnDef<LoanPaymentRecord>[]>(
		() => [
			{
				header: "No",
				accessorKey: "paymentNo",
				size: 50,
				meta: { bodyClassName: "text-center" },
			},
			{
				header: "Code",
				accessorKey: "code",
				cell: ({ row }) => row.original.code || "-",
				size: 140,
				meta: { bodyClassName: "text-center" },
			},
			{
				header: "Payment Date",
				accessorKey: "paidAt",
				cell: ({ row }) => formatDisplayDateTime(row.original.paidAt),
			},
			{
				header: "Amount",
				accessorKey: "amount",
				cell: ({ row }) => formatKHR(row.original.amount),
				meta: { bodyClassName: "text-right" },
			},
			{
				id: "actions",
				header: "Action",
				cell: ({ row }) =>
					onExportReceipt ? (
						<div className="flex justify-center">
							<Button size="sm" variant="outline" onClick={() => onExportReceipt(row.original)}>
								Export Receipt
							</Button>
						</div>
					) : null,
				meta: { bodyClassName: "text-center" },
			},
		],
		[onExportReceipt],
	);

	if (payments.length === 0) {
		return (
			<div className="flex items-center justify-center py-12 text-slate-400">
				<Text variant="body2">No payments found</Text>
			</div>
		);
	}

	return (
		<SmartDataTable
			className="flex-1 min-h-0 h-fit"
			maxBodyHeight="100%"
			data={pagedPayments}
			columns={columns}
			paginationConfig={{
				page: currentPage,
				pageSize,
				totalItems: payments.length,
				totalPages,
				paginationItems: Array.from({ length: totalPages }, (_, index) => index + 1),
				onPageChange: setPage,
				onPageSizeChange: (nextPageSize) => {
					setPageSize(nextPageSize);
					setPage(1);
				},
			}}
		/>
	);
}
