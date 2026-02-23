import { useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { SmartDataTable } from "@/core/components/common";
import type { Cycle, CyclePaymentView } from "@/core/types/cycle";
import { Button } from "@/core/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/core/ui/dialog";
import { Input } from "@/core/ui/input";
import { Label } from "@/core/ui/label";
import { useCyclePayments } from "../hooks/use-cycle-payments";

type CyclePaymentDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	cycle: Cycle | null;
};

function formatAmount(value: number): string {
	return value.toLocaleString();
}

export function CyclePaymentDialog({ open, onOpenChange, cycle }: CyclePaymentDialogProps) {
	const navigate = useNavigate();
	const [amount, setAmount] = useState("");
	const [paymentDate, setPaymentDate] = useState("");
	const [termMonths, setTermMonths] = useState("1");
	const [loanStartDate, setLoanStartDate] = useState("");
	const { payments, isLoadingPayments, createPayment, isCreatingPayment, convertToLoan, isConvertingToLoan } =
		useCyclePayments(cycle?.id);
	const cycleBalance = Math.max(0, (cycle?.totalAmount ?? 0) - (cycle?.totalPaidAmount ?? 0));
	const parsedAmount = Number(amount);
	const hasValidAmount = Number.isFinite(parsedAmount) && parsedAmount > 0;
	const isAmountExceeded = hasValidAmount && parsedAmount > cycleBalance;
	const canSubmit = Boolean(cycle) && !isCreatingPayment && !isConvertingToLoan && hasValidAmount && !isAmountExceeded;
	const parsedTermMonths = Number(termMonths);
	const hasValidTermMonths = Number.isInteger(parsedTermMonths) && parsedTermMonths > 0;
	const canConvertToLoan =
		Boolean(cycle) && cycleBalance > 0 && hasValidTermMonths && !isConvertingToLoan && !isCreatingPayment;

	useEffect(() => {
		if (!open) return;
		setAmount("");
		setPaymentDate(new Date().toISOString().slice(0, 10));
		setTermMonths("1");
		setLoanStartDate(new Date().toISOString().slice(0, 10));
	}, [open]);

	const columns = useMemo<ColumnDef<CyclePaymentView>[]>(
		() => [
			{
				accessorKey: "date",
				header: "Date",
				cell: ({ row }) => new Date(row.original.date).toLocaleDateString(),
			},
			{
				accessorKey: "refNo",
				header: "Ref No",
			},
			{
				accessorKey: "amount",
				header: "Amount",
				cell: ({ row }) => formatAmount(row.original.amount),
				meta: { bodyClassName: "text-right" },
			},
			{
				accessorKey: "paid",
				header: "Paid",
				cell: ({ row }) => formatAmount(row.original.paid),
				meta: { bodyClassName: "text-right" },
			},
			{
				accessorKey: "balance",
				header: "Balance",
				cell: ({ row }) => formatAmount(row.original.balance),
				meta: { bodyClassName: "text-right" },
			},
		],
		[],
	);

	const handleSubmit = async () => {
		if (!cycle) return;
		if (!hasValidAmount) {
			toast.error("Payment amount must be greater than 0");
			return;
		}
		if (isAmountExceeded) {
			toast.error("Payment amount cannot exceed remaining balance");
			return;
		}

		await createPayment({
			amount: parsedAmount,
			paymentDate: paymentDate ? new Date(`${paymentDate}T00:00:00.000Z`).toISOString() : new Date().toISOString(),
		});
		setAmount("");
	};

	const handleConvertToLoan = async () => {
		if (!cycle) return;
		if (cycleBalance <= 0) {
			toast.error("Cycle balance must be greater than 0 to convert");
			return;
		}
		if (!hasValidTermMonths) {
			toast.error("Term months must be greater than 0");
			return;
		}

		const loan = await convertToLoan({
			termMonths: parsedTermMonths,
			startDate: loanStartDate ? new Date(`${loanStartDate}T00:00:00.000Z`).toISOString() : new Date().toISOString(),
		});
		onOpenChange(false);
		navigate(`/dashboard/borrow/${loan.id}`);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-4xl">
				<DialogHeader>
					<DialogTitle>Create Cycle Payment</DialogTitle>
					<DialogDescription>
						{cycle
							? `${cycle.customerName} · ${new Date(cycle.startDate).toLocaleDateString()} ~ ${new Date(cycle.endDate).toLocaleDateString()}`
							: "No cycle selected"}
					</DialogDescription>
				</DialogHeader>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-3 py-2">
					<div className="space-y-1.5">
						<Label htmlFor="cycle-payment-amount">Amount</Label>
						<Input
							id="cycle-payment-amount"
							type="number"
							min={0}
							value={amount}
							onChange={(e) => setAmount(e.target.value)}
							placeholder="Enter payment amount"
							disabled={isCreatingPayment}
						/>
					</div>
					<div className="space-y-1.5">
						<Label htmlFor="cycle-payment-date">Payment Date</Label>
						<Input
							id="cycle-payment-date"
							type="date"
							value={paymentDate}
							onChange={(e) => setPaymentDate(e.target.value)}
							disabled={isCreatingPayment}
						/>
					</div>
				</div>
				<div className="text-sm text-slate-500">Remaining balance: {formatAmount(cycleBalance)}</div>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-3 py-2 border-t">
					<div className="space-y-1.5">
						<Label htmlFor="cycle-loan-term-months">Loan Term (Months)</Label>
						<Input
							id="cycle-loan-term-months"
							type="number"
							min={1}
							step={1}
							value={termMonths}
							onChange={(e) => setTermMonths(e.target.value)}
							placeholder="Enter term months"
							disabled={isConvertingToLoan}
						/>
					</div>
					<div className="space-y-1.5">
						<Label htmlFor="cycle-loan-start-date">Loan Start Date</Label>
						<Input
							id="cycle-loan-start-date"
							type="date"
							value={loanStartDate}
							onChange={(e) => setLoanStartDate(e.target.value)}
							disabled={isConvertingToLoan}
						/>
					</div>
				</div>

				<div className="space-y-2">
					<Label className="text-sm font-semibold">Payment History</Label>
					<SmartDataTable className="max-h-[320px]" maxBodyHeight="320px" data={payments} columns={columns} />
					{isLoadingPayments && <p className="text-xs text-slate-500">Loading payments...</p>}
				</div>

				<DialogFooter>
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={isCreatingPayment || isConvertingToLoan}
					>
						Close
					</Button>
					<Button variant="outline" onClick={handleConvertToLoan} disabled={!canConvertToLoan}>
						{isConvertingToLoan ? "Converting..." : "Convert To Loan"}
					</Button>
					<Button onClick={handleSubmit} disabled={!canSubmit}>
						{isCreatingPayment ? "Saving..." : "Create Payment"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
