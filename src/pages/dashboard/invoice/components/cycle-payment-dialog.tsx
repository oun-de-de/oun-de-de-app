import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { SmartDataTable } from "@/core/components/common";
import type { Cycle } from "@/core/types/cycle";
import { Button } from "@/core/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/core/ui/dialog";
import { Input } from "@/core/ui/input";
import { Label } from "@/core/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/core/ui/tabs";
import { useCyclePayments } from "../hooks/use-cycle-payments";
import { formatNumber } from "../utils/formatters";
import { PAYMENT_COLUMNS } from "./payment-columns";

type CyclePaymentDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	cycle: Cycle | null;
	defaultTab?: "payment" | "loan";
	hideTabSwitch?: boolean;
};

function toIsoStartOfDay(date: string): string {
	return new Date(`${date}T00:00:00.000Z`).toISOString();
}

function getLocalToday(): string {
	const now = new Date();
	const year = now.getFullYear();
	const month = String(now.getMonth() + 1).padStart(2, "0");
	const day = String(now.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

export function CyclePaymentDialog({
	open,
	onOpenChange,
	cycle,
	defaultTab = "payment",
	hideTabSwitch = false,
}: CyclePaymentDialogProps) {
	const navigate = useNavigate();
	const [activeTab, setActiveTab] = useState("payment");
	const [amount, setAmount] = useState("");
	const [paymentDate, setPaymentDate] = useState("");
	const [termMonths, setTermMonths] = useState("1");
	const [loanStartDate, setLoanStartDate] = useState("");
	const { payments, isLoadingPayments, createPayment, isCreatingPayment, convertToLoan, isConvertingToLoan } =
		useCyclePayments(cycle?.id);
	const hasCycle = cycle !== null;
	const isBusy = isCreatingPayment || isConvertingToLoan;
	const totalPaidAmount = isLoadingPayments
		? (cycle?.totalPaidAmount ?? 0)
		: payments.reduce((sum, payment) => sum + (payment.amount ?? 0), 0);
	const cycleBalance = Math.max(0, (cycle?.totalAmount ?? 0) - totalPaidAmount);
	const parsedAmount = Number(amount);
	const hasValidAmount = Number.isFinite(parsedAmount) && parsedAmount > 0;
	const isAmountExceeded = hasValidAmount && parsedAmount > cycleBalance;
	const canSubmit = hasCycle && !isBusy && hasValidAmount && !isAmountExceeded;
	const parsedTermMonths = Number(termMonths);
	const hasValidTermMonths = Number.isInteger(parsedTermMonths) && parsedTermMonths > 0;
	const canConvertToLoan = hasCycle && cycleBalance > 0 && hasValidTermMonths && !isBusy;

	useEffect(() => {
		if (!open) return;
		const today = getLocalToday();
		setActiveTab(defaultTab);
		setAmount("");
		setPaymentDate(today);
		setTermMonths("1");
		setLoanStartDate(today);
	}, [open, defaultTab]);

	const handleSubmit = async () => {
		if (!hasCycle) return;
		if (!paymentDate) {
			toast.error("Payment date is required");
			return;
		}
		if (!hasValidAmount) {
			toast.error("Payment amount must be greater than 0");
			return;
		}
		if (isAmountExceeded) {
			toast.error("Payment amount cannot exceed remaining balance");
			return;
		}

		try {
			await createPayment({
				amount: parsedAmount,
				paymentDate: toIsoStartOfDay(paymentDate),
			});
			onOpenChange(false);
		} catch (error) {
			// Expected to be handled by the mutation's onError callback
		}
	};

	const handleConvertToLoan = async () => {
		if (!hasCycle) return;
		if (cycleBalance <= 0) {
			toast.error("Cycle balance must be greater than 0 to convert");
			return;
		}
		if (!loanStartDate) {
			toast.error("Loan start date is required");
			return;
		}
		if (!hasValidTermMonths) {
			toast.error("Term months must be greater than 0");
			return;
		}

		try {
			const loan = await convertToLoan({
				termMonths: parsedTermMonths,
				startDate: toIsoStartOfDay(loanStartDate),
			});
			onOpenChange(false);
			navigate(`/dashboard/borrow/${loan.id}`);
		} catch (_error) {}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-5xl overflow-y-auto p-4 md:p-6">
				<DialogHeader className="pr-8">
					<DialogTitle>{defaultTab === "loan" ? "Convert Cycle To Loan" : "Create Cycle Payment"}</DialogTitle>
					<DialogDescription>
						{cycle
							? `${cycle.customerName} · ${new Date(cycle.startDate).toLocaleDateString()} ~ ${new Date(cycle.endDate).toLocaleDateString()}`
							: "No cycle selected"}
					</DialogDescription>
				</DialogHeader>

				<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-2">
					{!hideTabSwitch && (
						<TabsList className="grid w-full grid-cols-2">
							<TabsTrigger value="payment">Make Payment</TabsTrigger>
							<TabsTrigger value="loan">Convert to Loan</TabsTrigger>
						</TabsList>
					)}
					<TabsContent value="payment" className="space-y-4 pt-4">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
						<div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
							Remaining balance: <span className="font-semibold">{formatNumber(cycleBalance)}</span>
						</div>
					</TabsContent>
					<TabsContent value="loan" className="space-y-4 pt-4">
						<div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
							Remaining balance: <span className="font-semibold">{formatNumber(cycleBalance)}</span>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
					</TabsContent>
				</Tabs>

				<div className="space-y-2 mt-2">
					<Label className="text-sm font-semibold">Payment History</Label>
					<SmartDataTable className="max-h-[320px]" maxBodyHeight="320px" data={payments} columns={PAYMENT_COLUMNS} />
					{isLoadingPayments && <p className="text-xs text-slate-500">Loading payments...</p>}
				</div>

				<DialogFooter className="sm:flex-wrap pt-2">
					<Button variant="outline" onClick={() => onOpenChange(false)} disabled={isBusy} className="whitespace-nowrap">
						Close
					</Button>
					{activeTab === "payment" ? (
						<Button onClick={handleSubmit} disabled={!canSubmit} className="whitespace-nowrap">
							{isCreatingPayment ? "Saving..." : "Create Payment"}
						</Button>
					) : (
						<Button
							variant="destructive"
							onClick={handleConvertToLoan}
							disabled={!canConvertToLoan}
							className="whitespace-nowrap"
						>
							{isConvertingToLoan ? "Converting..." : "Convert To Loan"}
						</Button>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
