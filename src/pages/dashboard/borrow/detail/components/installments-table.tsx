import type { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { SmartDataTable } from "@/core/components/common";
import type { Installment } from "@/core/types/loan";
import { Button } from "@/core/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/core/ui/dialog";
import { Text } from "@/core/ui/typography";
import { getInstallmentsColumns } from "./installments-columns";

type InstallmentsTableProps = {
	installments: Installment[];
	onPay: (installmentId: string) => void;
	isPayPending?: boolean;
};

export function InstallmentsTable({ installments, onPay, isPayPending }: InstallmentsTableProps) {
	const [selectedInstallment, setSelectedInstallment] = useState<Installment | null>(null);
	const sortedInstallments = useMemo(
		() => [...installments].sort((a, b) => a.monthIndex - b.monthIndex),
		[installments],
	);
	const firstPayableInstallmentId = useMemo(
		() => sortedInstallments.find((item) => item.status === "unpaid" || item.status === "overdue")?.id,
		[sortedInstallments],
	);

	const columns = useMemo<ColumnDef<Installment>[]>(
		() =>
			getInstallmentsColumns({
				isPayPending,
				onSelectInstallment: setSelectedInstallment,
				allowPayInstallmentId: firstPayableInstallmentId,
			}),
		[isPayPending, firstPayableInstallmentId],
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
				data={sortedInstallments}
				columns={columns}
			/>
			<Dialog open={!!selectedInstallment} onOpenChange={(open) => (!open ? setSelectedInstallment(null) : undefined)}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Confirm Installment Payment</DialogTitle>
					</DialogHeader>
					<div className="space-y-1 text-sm text-slate-600">
						<p>Installment: {selectedInstallment?.monthIndex ?? "-"}</p>
						<p>Amount: {selectedInstallment?.amount?.toLocaleString() ?? "-"}</p>
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
		</>
	);
}
