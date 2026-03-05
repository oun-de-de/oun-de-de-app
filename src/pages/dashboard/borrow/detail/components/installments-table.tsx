import type { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { SmartDataTable } from "@/core/components/common";
import type { Installment } from "@/core/types/loan";
import { Button } from "@/core/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/core/ui/dialog";
import { Text } from "@/core/ui/typography";
import { formatKHR } from "@/core/utils/formatters";
import { getInstallmentsColumns } from "./installments-columns";

type InstallmentsTableProps = {
	installments: Installment[];
	onPay: (installmentId: string) => void;
	isPayPending?: boolean;
	onPostpone?: () => void;
	isPostponePending?: boolean;
};

export function InstallmentsTable({
	installments,
	onPay,
	isPayPending,
	onPostpone,
	isPostponePending,
}: InstallmentsTableProps) {
	const [selectedInstallment, setSelectedInstallment] = useState<Installment | null>(null);
	const [showPostponeConfirm, setShowPostponeConfirm] = useState(false);
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const sortedInstallments = useMemo(
		() => [...installments].sort((a, b) => a.monthIndex - b.monthIndex),
		[installments],
	);
	const totalPages = useMemo(
		() => Math.max(1, Math.ceil(sortedInstallments.length / pageSize)),
		[sortedInstallments.length, pageSize],
	);
	const currentPage = Math.min(page, totalPages);
	const pagedInstallments = useMemo(
		() => sortedInstallments.slice((currentPage - 1) * pageSize, currentPage * pageSize),
		[sortedInstallments, currentPage, pageSize],
	);
	const firstPayableInstallmentId = useMemo(
		() => sortedInstallments.find((item) => item.status === "unpaid" || item.status === "overdue")?.id,
		[sortedInstallments],
	);

	const columns = useMemo<ColumnDef<Installment>[]>(
		() =>
			getInstallmentsColumns({
				isPayPending,
				isPostponePending,
				onSelectInstallment: setSelectedInstallment,
				onPostpone: onPostpone ? () => setShowPostponeConfirm(true) : undefined,
				allowPayInstallmentId: firstPayableInstallmentId,
			}),
		[isPayPending, isPostponePending, onPostpone, firstPayableInstallmentId],
	);

	if (installments.length === 0) {
		return (
			<div className="flex items-center justify-center py-12 text-slate-400">
				<Text variant="body2">No installments found</Text>
			</div>
		);
	}

	return (
		<>
			<SmartDataTable
				className="flex-1 min-h-0 h-fit"
				maxBodyHeight="100%"
				data={pagedInstallments}
				columns={columns}
				paginationConfig={{
					page: currentPage,
					pageSize,
					totalItems: sortedInstallments.length,
					totalPages,
					paginationItems: Array.from({ length: totalPages }, (_, index) => index + 1),
					onPageChange: setPage,
					onPageSizeChange: (nextPageSize) => {
						setPageSize(nextPageSize);
						setPage(1);
					},
				}}
			/>
			{/* Pay Confirmation Dialog */}
			<Dialog open={!!selectedInstallment} onOpenChange={(open) => (!open ? setSelectedInstallment(null) : undefined)}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Confirm Installment Payment</DialogTitle>
					</DialogHeader>
					<div className="space-y-1 text-sm text-slate-600">
						<p>Installment: {selectedInstallment?.monthIndex ?? "-"}</p>
						<p>Amount: {formatKHR(selectedInstallment?.amount)}</p>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setSelectedInstallment(null)} disabled={isPayPending}>
							Cancel
						</Button>
						<Button
							onClick={() => {
								if (!selectedInstallment) return;
								onPay(selectedInstallment.id);
								setSelectedInstallment(null);
							}}
							disabled={isPayPending}
						>
							{isPayPending ? "Paying..." : "Confirm"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Postpone Confirmation Dialog */}
			<Dialog open={showPostponeConfirm} onOpenChange={setShowPostponeConfirm}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Confirm Postpone</DialogTitle>
					</DialogHeader>
					<div className="text-sm text-slate-600">
						<p>
							Are you sure you want to postpone the current installment? This will push all remaining installments
							forward by one month.
						</p>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setShowPostponeConfirm(false)} disabled={isPostponePending}>
							Cancel
						</Button>
						<Button
							variant="warning"
							onClick={() => {
								onPostpone?.();
								setShowPostponeConfirm(false);
							}}
							disabled={isPostponePending}
						>
							{isPostponePending ? "Postponing..." : "Postpone"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
