import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { SmartDataTable } from "@/core/components/common";
import type { Cycle, CyclePayment } from "@/core/types/cycle";
import { Button } from "@/core/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/core/ui/dialog";
import { Input } from "@/core/ui/input";
import { Label } from "@/core/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/core/ui/tabs";
import { cn } from "@/core/utils";
import { formatFlexibleDisplayDate } from "@/core/utils/date-display";
import { useCyclePaymentState } from "../hooks/use-cycle-payment-state";
import { useCyclePayments } from "../hooks/use-cycle-payments";
import { formatKHR } from "../utils/formatters";
import { getPaymentColumns } from "./payment-columns";

type CyclePaymentDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	cycle: Cycle | null;
	defaultTab?: "payment" | "loan";
	hideTabSwitch?: boolean;
	historyOnly?: boolean;
	onExportReceipt?: (payment: CyclePayment) => void;
	exportingPaymentId?: string | null;
};

function normalizeInputValue(value: string): string | undefined {
	const normalized = value.trim();
	return normalized || undefined;
}

function toApiLocalDateTime(dateTimeLocal: string): string | undefined {
	const normalized = normalizeInputValue(dateTimeLocal);
	if (!normalized) return undefined;
	const [datePart, timePart] = normalized.split("T");
	if (!datePart || !timePart) return undefined;
	return `${datePart}T${timePart.length === 5 ? `${timePart}:00` : timePart}`;
}

function toApiLocalDateStart(dateOnly: string): string | undefined {
	const normalized = normalizeInputValue(dateOnly);
	if (!normalized) return undefined;
	return `${normalized}T00:00:00`;
}

function getLocalDateParts(date = new Date()) {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return { year, month, day };
}

function getLocalToday(): string {
	const now = new Date();
	const { year, month, day } = getLocalDateParts(now);
	return `${year}-${month}-${day}`;
}

function getLocalNowDateTime(): string {
	const now = new Date();
	const { year, month, day } = getLocalDateParts(now);
	const hours = String(now.getHours()).padStart(2, "0");
	const minutes = String(now.getMinutes()).padStart(2, "0");
	return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function digitsOnly(value: string): string {
	return value.replace(/\D/g, "");
}

function generateNextPaymentCode(payments: CyclePayment[]): string {
	const REC_PREFIX = "REC-";
	let maxNumber = 0;
	let padding = 3;

	for (const payment of payments) {
		const normalizedCode = payment.code?.trim().toUpperCase();
		if (!normalizedCode?.startsWith(REC_PREFIX)) continue;

		const numericPart = normalizedCode.slice(REC_PREFIX.length);
		if (!/^\d+$/.test(numericPart)) continue;

		maxNumber = Math.max(maxNumber, Number(numericPart));
		padding = Math.max(padding, numericPart.length);
	}

	return `${REC_PREFIX}${String(maxNumber + 1).padStart(padding, "0")}`;
}

export function CyclePaymentDialog({
	open,
	onOpenChange,
	cycle,
	defaultTab = "payment",
	hideTabSwitch = false,
	historyOnly = false,
	onExportReceipt,
	exportingPaymentId,
}: CyclePaymentDialogProps) {
	const navigate = useNavigate();
	const [amountInputError, setAmountInputError] = useState("");
	const { payments, isLoadingPayments, createPayment, isCreatingPayment, convertToLoan, isConvertingToLoan } =
		useCyclePayments(cycle?.id);

	const ui = useCyclePaymentState({
		cycle,
		payments,
		historyOnly,
		isLoadingPayments,
		isCreatingPayment,
		isConvertingToLoan,
	});
	const { state, setters, derived } = ui;
	const {
		setActiveTab,
		setAmount,
		setPaymentCode,
		setPaymentDateTime,
		setMonthlyAmount,
		setLoanStartDate,
		setDueWarningDays,
	} = setters;
	const paymentColumns = useMemo(
		() =>
			getPaymentColumns({
				onExportReceipt,
				exportingPaymentId,
			}),
		[onExportReceipt, exportingPaymentId],
	);

	useEffect(() => {
		if (!open) return;
		const today = getLocalToday();
		const nowDateTime = getLocalNowDateTime();
		const nextPaymentCode = generateNextPaymentCode(payments);
		setActiveTab(defaultTab);
		setAmount("");
		setPaymentCode(nextPaymentCode);
		setAmountInputError("");
		setPaymentDateTime(nowDateTime);
		setMonthlyAmount("");
		setLoanStartDate(today);
		setDueWarningDays("5");
	}, [
		open,
		defaultTab,
		setActiveTab,
		setAmount,
		setPaymentDateTime,
		setMonthlyAmount,
		setLoanStartDate,
		setDueWarningDays,
		payments,
	]);

	const handleSubmit = async () => {
		if (!derived.hasCycle) return;
		if (!state.paymentDateTime) {
			toast.error("Payment date is required");
			return;
		}
		if (!derived.hasValidAmount) {
			toast.error("Payment amount must be greater than 0");
			return;
		}
		if (!state.paymentCode.trim()) {
			toast.error("Payment code is required");
			return;
		}
		if (derived.isAmountExceeded) {
			toast.error("Payment amount cannot exceed remaining balance");
			return;
		}

		try {
			const paymentDate = toApiLocalDateTime(state.paymentDateTime);
			if (!paymentDate) {
				toast.error("Payment date is invalid");
				return;
			}

			await createPayment({
				code: state.paymentCode.trim(),
				amount: derived.parsedAmount,
				paymentDate,
			});
			onOpenChange(false);
		} catch {
			// Expected to be handled by the mutation's onError callback
		}
	};

	const handleConvertToLoan = async () => {
		if (!derived.hasCycle) return;
		if (derived.cycleBalance <= 0) {
			toast.error("Cycle balance must be greater than 0 to convert");
			return;
		}
		if (!state.loanStartDate) {
			toast.error("Loan start date is required");
			return;
		}
		if (!derived.hasValidMonthlyAmount) {
			toast.error("Monthly amount must be greater than 0");
			return;
		}
		if (!derived.hasValidDueWarningDays) {
			toast.error("Due date warning days must be 0 or greater");
			return;
		}

		try {
			const startDate = toApiLocalDateStart(state.loanStartDate);
			if (!startDate) {
				toast.error("Loan start date is invalid");
				return;
			}

			const loan = await convertToLoan({
				loanInstallmentAmount: derived.parsedMonthlyAmount,
				startDate,
				dueWarningDays: derived.parsedDueWarningDays,
			});
			onOpenChange(false);
			navigate(`/dashboard/loan/${loan.id}`);
		} catch (_error) {}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="flex max-h-[calc(100vh-1rem)] w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] flex-col overflow-hidden gap-3 p-3 sm:max-h-[calc(100vh-2rem)] sm:max-w-3xl sm:gap-4 sm:p-4 xl:max-w-5xl xl:p-6">
				<DialogHeader className="pr-8 sm:pr-10">
					<DialogTitle>
						{historyOnly
							? "Payment Histories"
							: defaultTab === "loan"
								? "Convert Cycle To Loan"
								: "Create Cycle Payment"}
					</DialogTitle>
					<DialogDescription>
						{cycle
							? `${cycle.customerName} · ${formatFlexibleDisplayDate(cycle.startDate)} ~ ${formatFlexibleDisplayDate(cycle.endDate)}`
							: "No cycle selected"}
					</DialogDescription>
				</DialogHeader>
				<div className="min-h-0 flex-1 overflow-y-auto pr-0 sm:pr-1">
					{cycle && (
						<div className="grid grid-cols-1 gap-2 rounded-md border bg-slate-50 p-3 text-xs text-slate-600 sm:grid-cols-2 xl:grid-cols-3">
							<div>Status: {cycle.status}</div>
							<div>Customer: {cycle.customerName}</div>
							<div>Total: {formatKHR(cycle.totalAmount)}</div>
							<div>Paid: {formatKHR(derived.totalPaidAmount)}</div>
							<div>Balance: {formatKHR(derived.cycleBalance)}</div>
						</div>
					)}

					{!historyOnly && (
						<Tabs value={state.activeTab} onValueChange={setters.setActiveTab} className="mt-2 w-full">
							{!hideTabSwitch && (
								<TabsList className="grid h-auto w-full grid-cols-1 gap-1 sm:grid-cols-2">
									<TabsTrigger value="payment" className="whitespace-normal px-3 py-2 text-center">
										Make Payment
									</TabsTrigger>
									<TabsTrigger value="loan" className="whitespace-normal px-3 py-2 text-center">
										Convert to Loan
									</TabsTrigger>
								</TabsList>
							)}
							<TabsContent value="payment" className="space-y-4 pt-4">
								<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
									<div className="space-y-1.5">
										<Label htmlFor="cycle-payment-code">Payment Code</Label>
										<Input
											id="cycle-payment-code"
											type="text"
											value={state.paymentCode}
											onChange={(e) => setPaymentCode(e.target.value)}
											placeholder="Enter payment code"
											disabled={isCreatingPayment}
										/>
									</div>
									<div className="space-y-1.5">
										<Label htmlFor="cycle-payment-amount">Amount</Label>
										<Input
											id="cycle-payment-amount"
											type="text"
											inputMode="numeric"
											pattern="[0-9]*"
											className={cn(amountInputError && "border-red-500 focus-visible:ring-red-500")}
											value={state.amount}
											onChange={(e) => {
												const rawValue = e.target.value;
												const normalizedValue = digitsOnly(rawValue);
												setAmount(normalizedValue);
												setAmountInputError(rawValue !== normalizedValue ? "Only numbers are allowed" : "");
											}}
											placeholder="Enter payment amount"
											disabled={isCreatingPayment}
										/>
										{amountInputError ? (
											<p className="text-[10px] font-medium text-red-500">{amountInputError}</p>
										) : null}
									</div>
									<div className="space-y-1.5 sm:col-span-2">
										<Label htmlFor="cycle-payment-date">Payment Date Time</Label>
										<Input
											id="cycle-payment-date"
											type="datetime-local"
											value={state.paymentDateTime}
											onChange={(e) => setters.setPaymentDateTime(e.target.value)}
											disabled={isCreatingPayment}
										/>
									</div>
								</div>
								<div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
									Remaining balance: <span className="font-semibold">{formatKHR(derived.cycleBalance)}</span>
								</div>
							</TabsContent>
							<TabsContent value="loan" className="space-y-4 pt-4">
								<div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
									Remaining balance: <span className="font-semibold">{formatKHR(derived.cycleBalance)}</span>
								</div>
								<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
									<div className="space-y-1.5">
										<Label htmlFor="cycle-loan-monthly-amount">Monthly Amount (៛)</Label>
										<div className="relative">
											<span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">
												៛
											</span>
											<Input
												id="cycle-loan-monthly-amount"
												type="number"
												min={1}
												value={state.monthlyAmount}
												onChange={(e) => setters.setMonthlyAmount(e.target.value)}
												placeholder="0"
												disabled={isConvertingToLoan}
												className="pl-7"
											/>
										</div>
									</div>
									<div className="space-y-1.5">
										<Label htmlFor="cycle-loan-start-date">Loan Start Date</Label>
										<Input
											id="cycle-loan-start-date"
											type="date"
											value={state.loanStartDate}
											onChange={(e) => setters.setLoanStartDate(e.target.value)}
											disabled={isConvertingToLoan}
										/>
									</div>
									<div className="space-y-1.5">
										<Label htmlFor="cycle-loan-due-warning-days">Due Date Warning Days</Label>
										<Input
											id="cycle-loan-due-warning-days"
											type="number"
											min={0}
											value={state.dueWarningDays}
											onChange={(e) => setDueWarningDays(e.target.value)}
											placeholder="Enter warning days"
											disabled={isConvertingToLoan}
										/>
									</div>
								</div>
							</TabsContent>
						</Tabs>
					)}

					<div className="mt-2 flex min-h-0 flex-col space-y-2">
						<Label className="text-sm font-semibold">Payment Histories</Label>
						<SmartDataTable
							className="rounded-md border border-slate-200 pb-2"
							maxBodyHeight="clamp(180px, 30vh, 320px)"
							minBodyHeight="clamp(140px, 22vh, 200px)"
							variant="borderless"
							data={derived.pagedData}
							columns={paymentColumns}
							paginationConfig={{
								page: state.page,
								pageSize: state.pageSize,
								totalItems: payments.length,
								totalPages: derived.totalPages,
								paginationItems: Array.from({ length: derived.totalPages }, (_, i) => i + 1),
								onPageChange: setters.setPage,
								onPageSizeChange: setters.setPageSize,
							}}
						/>
						{isLoadingPayments && <p className="text-xs text-slate-500">Loading payments...</p>}
					</div>
				</div>

				<DialogFooter className="shrink-0 border-t pt-3 sm:flex-wrap">
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={derived.isBusy}
						className="w-full whitespace-nowrap sm:w-auto"
					>
						Close
					</Button>
					{!historyOnly && state.activeTab === "payment" ? (
						<Button onClick={handleSubmit} disabled={!derived.canSubmit} className="w-full whitespace-nowrap sm:w-auto">
							{isCreatingPayment ? "Saving..." : "Create Payment"}
						</Button>
					) : !historyOnly ? (
						<Button
							variant="destructive"
							onClick={handleConvertToLoan}
							disabled={!derived.canConvertToLoan}
							className="w-full whitespace-nowrap sm:w-auto"
						>
							{isConvertingToLoan ? "Converting..." : "Convert To Loan"}
						</Button>
					) : null}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
