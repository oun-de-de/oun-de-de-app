import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { z } from "zod";

import { SmartDataTable } from "@/core/components/common";
import { useDialogSubmitHandler } from "@/core/hooks/use-dialog-submit-handler";
import { type Cycle, type CyclePayment, getCycleStatusLabel, getCycleStatusVariant } from "@/core/types/cycle";
import { Badge } from "@/core/ui/badge";
import { Button } from "@/core/ui/button";
import { RefreshCw } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/core/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/core/ui/form";
import { Input } from "@/core/ui/input";
import { Label } from "@/core/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/core/ui/tabs";
import { formatFlexibleDisplayDate } from "@/core/utils/date-display";
import { cn } from "@/core/utils";
import {
	formatDateStartLocalApiValueFromInput,
	formatDateTimeLocalApiValueFromInput,
	getLocalNowDateTime,
	getLocalToday,
} from "@/pages/dashboard/accounting/utils/format-local-date-time";
import { FormDatePicker } from "@/pages/dashboard/accounting/components/form-date-picker";

import { useCyclePaymentDialogState } from "../hooks/use-cycle-payment-dialog-state";
import { useCyclePayments } from "../hooks/use-cycle-payments";
import { formatKHR } from "../utils/formatters";
import { getPaymentColumns } from "./payment-columns";
import { FormDateTimeLocalPicker } from "../../accounting/components/form-date-time-local-picker";

function getPaymentSchema(maxAmount: number) {
	return z.object({
		paymentCode: z.string().trim().min(1, "Payment code is required"),
		amount: z
			.string()
			.min(1, "Payment amount is required")
			.refine((val) => Number(val) > 0, "Amount must be greater than 0")
			.refine((val) => Number(val) <= maxAmount, "Amount cannot exceed cycle balance"),
		paymentDateTime: z.string().trim().min(1, "Payment date is required"),
	});
}

const loanSchema = z.object({
	loanCode: z.string().trim().min(1, "Loan code is required"),
	loanStartDate: z.string().trim().min(1, "Loan start date is required"),
	monthlyAmount: z
		.string()
		.min(1, "Monthly amount is required")
		.refine((val) => Number(val) > 0, "Amount must be greater than 0"),
	dueWarningDays: z
		.string()
		.trim()
		.refine((val) => val === "" || Number.isInteger(Number(val)), "Must be a whole number")
		.refine((val) => val === "" || Number(val) >= 0, "Must be 0 or greater"),
});

type LoanFormValues = z.infer<typeof loanSchema>;
type PaymentFormValues = {
	paymentCode: string;
	amount: string;
	paymentDateTime: string;
};

function digitsOnly(value: string): string {
	return value.replace(/\D/g, "");
}

export function createPaymentFormDefaults(): PaymentFormValues {
	return {
		paymentCode: "",
		amount: "",
		paymentDateTime: getLocalNowDateTime(),
	};
}

export function createLoanFormDefaults(): LoanFormValues {
	return {
		loanCode: "",
		loanStartDate: getLocalToday(),
		monthlyAmount: "",
		dueWarningDays: "5",
	};
}

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

	const { payments, isLoadingPayments, createPayment, isCreatingPayment, convertToLoan, isConvertingToLoan } =
		useCyclePayments(cycle?.id);
	const currentCycleBalance = Math.max(
		0,
		(cycle?.totalAmount ?? 0) -
			(isLoadingPayments
				? (cycle?.totalPaidAmount ?? 0)
				: payments.reduce((sum, payment) => sum + (payment.amount ?? 0), 0)),
	);

	const paymentColumns = useMemo(
		() => getPaymentColumns({ onExportReceipt, exportingPaymentId }),
		[onExportReceipt, exportingPaymentId],
	);

	// Forms
	const paymentSchema = useMemo(() => getPaymentSchema(currentCycleBalance), [currentCycleBalance]);
	const paymentForm = useForm<PaymentFormValues>({
		resolver: zodResolver(paymentSchema),
		defaultValues: createPaymentFormDefaults(),
	});

	const loanForm = useForm<LoanFormValues>({
		resolver: zodResolver(loanSchema),
		defaultValues: createLoanFormDefaults(),
	});

	const {
		activeTab,
		setActiveTab,
		page,
		setPage,
		pageSize,
		setPageSize,
		pagedData,
		totalPages,
		totalPaidAmount,
		cycleBalance,
		isFetchingPaymentCode,
		applyGeneratedPaymentCode,
		isFetchingLoanCode,
		applyGeneratedLoanCode,
	} = useCyclePaymentDialogState({
		open,
		cycle,
		defaultTab,
		historyOnly,
		payments,
		isLoadingPayments,
		paymentForm,
		loanForm,
		createPaymentFormDefaults,
		createLoanFormDefaults,
	});
	const submitAndClose = useDialogSubmitHandler({
		closeDialog: () => onOpenChange(false),
	});

	const onPaymentSubmit = async (values: z.infer<typeof paymentSchema>) => {
		if (!cycle) return;
		const paymentDate = formatDateTimeLocalApiValueFromInput(values.paymentDateTime);
		if (!paymentDate) {
			toast.error("Payment date is invalid");
			return;
		}

		await submitAndClose(async () => {
			try {
				await createPayment({
					code: values.paymentCode.trim(),
					amount: Number(values.amount),
					paymentDate,
				});
			} catch (e) {
				if (import.meta.env.DEV) {
					console.error("Payment submission failed:", e);
				}
				throw e;
			}
		});
	};

	const onLoanSubmit = async (values: LoanFormValues) => {
		if (!cycle) return;
		if (cycleBalance <= 0) {
			toast.error("Cycle balance must be greater than 0 to convert");
			return;
		}
		const startDate = formatDateStartLocalApiValueFromInput(values.loanStartDate);
		if (!startDate) {
			toast.error("Loan start date is invalid");
			return;
		}

		await submitAndClose(async () => {
			try {
				const normalizedDueWarningDays = values.dueWarningDays.trim();
				const loan = await convertToLoan({
					code: values.loanCode.trim(),
					loanInstallmentAmount: Number(values.monthlyAmount),
					startDate,
					...(normalizedDueWarningDays === ""
						? {}
						: { dueWarningDays: Number(normalizedDueWarningDays) }),
				});
				navigate(`/dashboard/loan/${loan.id}`);
			} catch (e) {
				if (import.meta.env.DEV) {
					console.error("Loan conversion failed:", e);
				}
				throw e;
			}
		});
	};

	return (
		<Dialog open={open} onOpenChange={isCreatingPayment || isConvertingToLoan ? undefined : onOpenChange}>
			<DialogContent className="flex max-h-[calc(100vh-1rem)] w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] flex-col overflow-hidden gap-3 p-3 sm:max-h-[calc(100vh-2rem)] sm:max-w-3xl sm:gap-4 sm:p-4 xl:max-w-5xl xl:p-6">
				<DialogHeader className="pr-8 sm:pr-10">
					<DialogTitle>
						{historyOnly
							? "Payment Histories"
							: activeTab === "loan"
								? "Convert Cycle To Loan"
								: "Create Cycle Payment"}
					</DialogTitle>
					<DialogDescription>
						{cycle
							? `${cycle.customerName} · ${formatFlexibleDisplayDate(cycle.startDate)} ~ ${formatFlexibleDisplayDate(cycle.endDate)}`
							: "No cycle selected"}
					</DialogDescription>
				</DialogHeader>
				<div className="min-h-0 flex-1 overflow-y-auto p-1 -m-1 sm:pr-2">
					{cycle && (
						<div className="grid grid-cols-2 gap-3 rounded-md border border-slate-200 bg-slate-50 p-4 text-xs shadow-sm md:grid-cols-5">
							<div className="col-span-2 flex flex-col justify-center border-b border-slate-200 pb-2 md:col-span-1 md:border-b-0 md:border-r md:pb-0">
								<span className="mb-0.5 font-medium text-slate-500">Customer</span>
								<span className="font-semibold text-slate-800 line-clamp-1" title={cycle.customerName}>
									{cycle.customerName}
								</span>
							</div>
							<div className="flex flex-col justify-center items-start">
								<span className="mb-0.5 font-medium text-slate-500">Status</span>
								<Badge variant={getCycleStatusVariant(cycle.status)}>{getCycleStatusLabel(cycle.status)}</Badge>
							</div>
							<div className="flex flex-col justify-center">
								<span className="mb-0.5 font-medium text-slate-500">Total</span>
								<span className="font-semibold text-slate-800">{formatKHR(cycle.totalAmount)}</span>
							</div>
							<div className="flex flex-col justify-center">
								<span className="mb-0.5 font-medium text-slate-500">Paid</span>
								<span className="font-semibold text-green-700">{formatKHR(totalPaidAmount)}</span>
							</div>
							<div className="flex flex-col justify-center">
								<span className="mb-0.5 font-medium text-slate-500">Balance</span>
								<span className="font-bold text-red-600">{formatKHR(cycleBalance)}</span>
							</div>
						</div>
					)}

					{!historyOnly && (
						<Tabs
							value={activeTab}
							onValueChange={(val) => setActiveTab(val as "payment" | "loan")}
							className="mt-2 w-full"
						>
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
							<div className="mb-2 mt-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
								Remaining balance: <span className="font-semibold">{formatKHR(cycleBalance)}</span>
							</div>
							<TabsContent value="payment" className="space-y-4">
								<Form {...paymentForm}>
									<form id="payment-form" onSubmit={paymentForm.handleSubmit(onPaymentSubmit)} className="space-y-4">
										<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
											<FormField
												control={paymentForm.control}
												name="paymentCode"
												render={({ field, fieldState }) => (
													<FormItem>
														<FormLabel>Payment Code</FormLabel>
														<div className="relative group">
															<FormControl>
																<Input
																	{...field}
																	placeholder="Enter payment code"
																	disabled={isCreatingPayment}
																	className="pr-10"
																/>
															</FormControl>
															<button
																type="button"
																onClick={() => applyGeneratedPaymentCode(true)}
																disabled={isFetchingPaymentCode || isCreatingPayment}
																className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 flex items-center justify-center rounded-md text-slate-400 hover:text-sky-500 hover:bg-sky-50 transition-colors disabled:opacity-50"
																title="Refresh Payment Code"
															>
																<RefreshCw className={cn("h-3.5 w-3.5", isFetchingPaymentCode && "animate-spin")} />
															</button>
														</div>
														{fieldState.error && (
															<p className="text-xs text-rose-500 mt-1">{fieldState.error.message}</p>
														)}
													</FormItem>
												)}
											/>
											<FormField
												control={paymentForm.control}
												name="amount"
												render={({ field, fieldState }) => (
													<FormItem>
														<FormLabel>Amount</FormLabel>
														<FormControl>
															<Input
																{...field}
																type="text"
																inputMode="numeric"
																placeholder="Enter payment amount"
																disabled={isCreatingPayment}
																onChange={(e) => field.onChange(digitsOnly(e.target.value))}
															/>
														</FormControl>
														{fieldState.error && (
															<p className="text-xs text-rose-500 mt-1">{fieldState.error.message}</p>
														)}
													</FormItem>
												)}
											/>
											<FormField
												control={paymentForm.control}
												name="paymentDateTime"
												render={({ fieldState }) => (
													<FormItem className="sm:col-span-2">
														<FormLabel>Payment Date Time</FormLabel>
														<FormControl>
															<FormDateTimeLocalPicker
																control={paymentForm.control}
																name="paymentDateTime"
																error={fieldState.error?.message}
																disabled={isCreatingPayment}
															/>
														</FormControl>
													</FormItem>
												)}
											/>
										</div>
									</form>
								</Form>
							</TabsContent>
							<TabsContent value="loan" className="space-y-4">
								<Form {...loanForm}>
									<form id="loan-form" onSubmit={loanForm.handleSubmit(onLoanSubmit)} className="space-y-4">
										<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
											<FormField
												control={loanForm.control}
												name="loanCode"
												render={({ field, fieldState }) => (
													<FormItem>
														<FormLabel>Loan Code</FormLabel>
														<div className="relative group">
															<FormControl>
																<Input
																	{...field}
																	placeholder="Enter loan code"
																	disabled={isConvertingToLoan}
																	className="pr-10"
																/>
															</FormControl>
															<button
																type="button"
																onClick={() => applyGeneratedLoanCode(true)}
																disabled={isFetchingLoanCode || isConvertingToLoan}
																className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 flex items-center justify-center rounded-md text-slate-400 hover:text-sky-500 hover:bg-sky-50 transition-colors disabled:opacity-50"
																title="Refresh Loan Code"
															>
																<RefreshCw className={cn("h-3.5 w-3.5", isFetchingLoanCode && "animate-spin")} />
															</button>
														</div>
														{fieldState.error && (
															<p className="text-xs text-rose-500 mt-1">{fieldState.error.message}</p>
														)}
													</FormItem>
												)}
											/>
											<FormField
												control={loanForm.control}
												name="monthlyAmount"
												render={({ field }) => (
													<FormItem>
														<FormLabel>Monthly Amount (៛)</FormLabel>
														<div className="relative">
															<span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">
																៛
															</span>
															<FormControl>
																<Input
																	{...field}
																	type="text"
																	inputMode="numeric"
																	placeholder="0"
																	className="pl-7"
																	disabled={isConvertingToLoan}
																	onChange={(e) => field.onChange(digitsOnly(e.target.value))}
																/>
															</FormControl>
														</div>
														<FormMessage />
													</FormItem>
												)}
											/>
											<FormField
												control={loanForm.control}
												name="loanStartDate"
												render={({ fieldState }) => (
													<FormItem>
														<FormLabel>Loan Start Date</FormLabel>
														<FormControl>
															<FormDatePicker
																control={loanForm.control}
																name="loanStartDate"
																disabled={isConvertingToLoan}
																error={fieldState.error?.message}
																valueMode="date-string"
																hideError
															/>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
											<FormField
												control={loanForm.control}
												name="dueWarningDays"
												render={({ field }) => (
													<FormItem>
														<FormLabel>Due Date Warning Days</FormLabel>
														<FormControl>
															<Input
																{...field}
																type="text"
																inputMode="numeric"
																placeholder="Enter warning days"
																disabled={isConvertingToLoan}
																onChange={(e) => field.onChange(digitsOnly(e.target.value))}
															/>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
										</div>
									</form>
								</Form>
							</TabsContent>
						</Tabs>
					)}

					<div className="mt-4 flex min-h-0 flex-col space-y-2">
						<Label className="text-sm font-semibold">Payment Histories</Label>
						<SmartDataTable
							className="rounded-md border border-slate-200 pb-2"
							maxBodyHeight="none"
							minBodyHeight="0"
							variant="borderless"
							data={pagedData}
							columns={paymentColumns}
							paginationConfig={{
								page,
								pageSize,
								totalItems: payments.length,
								totalPages,
								paginationItems: Array.from({ length: totalPages }, (_, i) => i + 1),
								onPageChange: setPage,
								onPageSizeChange: setPageSize,
							}}
						/>
						{isLoadingPayments && <p className="text-xs text-slate-500">Loading payments...</p>}
					</div>
				</div>

				<DialogFooter className="shrink-0 border-t pt-3 sm:flex-wrap sm:gap-2 mr-0 sm:mr-1">
					<Button
						type="button"
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={isCreatingPayment || isConvertingToLoan}
						className="w-full whitespace-nowrap sm:w-auto"
					>
						Close
					</Button>
					{!historyOnly && activeTab === "payment" ? (
						<Button
							type="submit"
							form="payment-form"
							disabled={isCreatingPayment || !cycle} // Disable if no cycle or payment is being created
							className="w-full whitespace-nowrap sm:w-auto mt-2 sm:mt-0"
						>
							{isCreatingPayment ? "Saving..." : "Create Payment"}
						</Button>
					) : !historyOnly ? (
						<Button
							type="submit"
							form="loan-form"
							variant="destructive"
							disabled={isConvertingToLoan || cycleBalance <= 0} // Disable if no cycle or payment is being created
							className="w-full whitespace-nowrap text-white sm:w-auto mt-2 sm:mt-0"
						>
							{isConvertingToLoan ? "Converting..." : "Convert To Loan"}
						</Button>
					) : null}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
