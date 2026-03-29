import { BackButton } from "@/core/components/common";
import { Badge } from "@/core/ui/badge";
import { Button } from "@/core/ui/button";
import { Checkbox } from "@/core/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/core/ui/dialog";
import { Input } from "@/core/ui/input";
import { Label } from "@/core/ui/label";
import { Separator } from "@/core/ui/separator";
import { Text } from "@/core/ui/typography";
import type { InvoiceExportPreviewLocationState } from "@/core/types/invoice";
import { formatDisplayDate, formatDisplayDateTime, formatKHR } from "@/core/utils/formatters";
import { useRouter } from "@/routes/hooks/use-router";
import { useCallback, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { ReportLayout } from "../../reports/components/layout/report-layout";
import {
	type ReportTemplateColumn,
	type ReportTemplateRow,
	type ReportTemplateSummaryRow,
	ReportTemplateTable,
} from "../../reports/components/layout/report-template-table";
import { formatReportTimestamp } from "../../reports/report-detail/constants";
import { LoanPaymentsTable } from "./components/loan-payments-table";
import { useBorrowDetail } from "./hooks/use-borrow-detail";

function formatLoanStatusLabel(status?: "normal" | "due" | "complete") {
	if (status === "due") return "Due";
	if (status === "complete") return "Complete";
	return "Normal";
}

export default function BorrowDetailPage() {
	const { id } = useParams<{ id: string }>();
	const router = useRouter();
	const location = useLocation();
	const navigate = useNavigate();
	const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
	const [shouldUpdateDueDate, setShouldUpdateDueDate] = useState(true);
	const [paymentCode, setPaymentCode] = useState("");
	const [paymentAmount, setPaymentAmount] = useState("");
	const [isBorrowMoreDialogOpen, setIsBorrowMoreDialogOpen] = useState(false);
	const [additionalAmount, setAdditionalAmount] = useState("");
	const [isEditTermsDialogOpen, setIsEditTermsDialogOpen] = useState(false);
	const [isPostponeDialogOpen, setIsPostponeDialogOpen] = useState(false);
	const [installmentAmountInput, setInstallmentAmountInput] = useState("");
	const [dueWarningDaysInput, setDueWarningDaysInput] = useState("");
	const {
		loan,
		isLoading,
		isError,
		payments,
		currentDue,
		createPayment,
		isCreatingPayment,
		postponeLoan,
		isPostponing,
		extendLoan,
		isExtendingLoan,
		updateLoan,
		isUpdatingLoan,
	} = useBorrowDetail(id || "");

	const paidTotal = loan?.paidAmount ?? 0;
	const remainingBalance = loan ? Math.max(loan.principalAmount - paidTotal, 0) : 0;
	const isLoanComplete = loan?.status === "complete";
	const printColumns = useMemo<ReportTemplateColumn[]>(
		() => [
			{
				id: "paymentNo",
				header: "Payment No",
				accessorFn: (row) => row.cells.paymentNo,
				meta: { align: "left" },
			},
			{
				id: "paymentDate",
				header: "Payment Date",
				accessorFn: (row) => row.cells.paymentDate,
				meta: { align: "left" },
			},
			{
				id: "amount",
				header: "Amount",
				accessorFn: (row) => row.cells.amount,
				meta: { align: "right" },
			},
		],
		[],
	);
	const printRows = useMemo<ReportTemplateRow[]>(
		() =>
			payments.map((payment) => ({
				key: payment.id,
				cells: {
					paymentNo: payment.paymentNo,
					paymentDate: formatDisplayDateTime(payment.paidAt),
					amount: formatKHR(payment.amount),
				},
			})),
		[payments],
	);
	const printHeaderContent = useMemo(
		() => [
			<div key="loan-print-header" className="flex flex-col gap-4 text-black">
				<div className="text-center">
					<div className="text-2xl font-bold">Loan Payment Histories</div>
					<div className="mt-1 text-lg font-semibold">
						{loan?.borrowerType === "employee" ? "Employee Loan" : "Customer Loan"}
					</div>
				</div>
				<div className="grid grid-cols-3 items-start gap-8 border-b border-slate-300 pb-4 text-[13px] font-semibold">
					<div className="text-left">
						<div>Borrower: {loan?.borrowerName ?? "-"}</div>
					</div>
					<div className="text-center">
						<div>Start Date: {loan ? formatDisplayDate(loan.startDate) : "-"}</div>
						<div className="mt-1">Next Due Date: {currentDue ? formatDisplayDate(currentDue.dueDate) : "-"}</div>
					</div>
					<div className="text-right">
						<div>Status: {formatLoanStatusLabel(loan?.status)}</div>
						<div>Installment: {loan ? formatKHR(loan.installmentAmount) : "-"}</div>
						<div className="mt-1">Remaining Balance: {loan ? formatKHR(remainingBalance) : "-"}</div>
					</div>
				</div>
			</div>,
		],
		[currentDue, loan, remainingBalance],
	);
	const printSummaryRows = useMemo<ReportTemplateSummaryRow[]>(
		() => [
			{
				key: "total-paid",
				label: "Total Paid",
				value: loan ? formatKHR(loan.paidAmount) : formatKHR(0),
			},
			{
				key: "remaining-balance",
				label: "Remaining Balance",
				value: loan ? formatKHR(remainingBalance) : formatKHR(0),
			},
		],
		[loan, remainingBalance],
	);
	const printTimestamp = useMemo(() => formatReportTimestamp("administrator", new Date()), []);
	const handleBackToLoans = useCallback(() => {
		router.push("/dashboard/loan");
	}, [router]);

	const handleCreatePayment = async () => {
		const parsedAmount = Number(paymentAmount);
		if (!currentDue || !Number.isFinite(parsedAmount) || parsedAmount <= 0) return;
		if (!paymentCode.trim()) return;
		await createPayment({
			code: paymentCode.trim(),
			amount: parsedAmount,
			shouldUpdateDueDate,
		});
		setIsPaymentDialogOpen(false);
		setPaymentCode("");
		setPaymentAmount(currentDue ? String(currentDue.amount) : "");
	};

	const handleBorrowMore = async () => {
		const parsedAmount = Number(additionalAmount);
		if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) return;
		await extendLoan(parsedAmount);
		setIsBorrowMoreDialogOpen(false);
		setAdditionalAmount("");
	};

	const handleOpenEditTermsDialog = () => {
		if (!loan || loan.status === "complete") return;
		setInstallmentAmountInput(String(loan.installmentAmount ?? ""));
		setDueWarningDaysInput(String(loan.dueWarningDays ?? 5));
		setIsEditTermsDialogOpen(true);
	};

	const handleUpdateLoanTerms = async () => {
		const parsedInstallmentAmount = Number(installmentAmountInput);
		const parsedDueWarningDays = Number(dueWarningDaysInput);
		if (!Number.isFinite(parsedInstallmentAmount) || parsedInstallmentAmount <= 0) return;
		if (!Number.isFinite(parsedDueWarningDays) || parsedDueWarningDays < 0 || parsedDueWarningDays > 29) return;

		await updateLoan({
			installmentAmount: parsedInstallmentAmount,
			dueWarningDays: parsedDueWarningDays,
		});
		setIsEditTermsDialogOpen(false);
	};

	const handlePrintPayments = () => {
		if (payments.length === 0) return;
		window.print();
	};

	const handleExportPaymentReceipt = (payment: (typeof payments)[number]) => {
		if (!loan) return;

		const exportPreviewState: InvoiceExportPreviewLocationState = {
			selectedInvoiceIds: [],
			previewRows: [
				{
					refNo: payment.code || `PAY-${payment.paymentNo}`,
					customerName: loan.borrowerName,
					date: payment.paidAt,
					productName: "Loan Payment",
					unit: null,
					pricePerProduct: payment.amount,
					quantityPerProduct: 1,
					quantity: 1,
					amount: payment.amount,
					total: payment.amount,
					memo: `${loan.borrowerType === "employee" ? "Employee" : "Customer"} loan payment receipt`,
					paid: payment.amount,
					balance: 0,
				},
			],
			returnPath: location.pathname,
			autoPrint: true,
			initialPaperSizeMode: "a5",
			initialOrientationMode: "landscape",
		};

		navigate("/dashboard/loan/receipt-preview?paper=a5&orientation=landscape", {
			state: exportPreviewState,
		});
	};

	if (isLoading) {
		return (
			<div className="flex h-full items-center justify-center">
				<Text variant="body1">Loading...</Text>
			</div>
		);
	}

	if (isError || !loan) {
		return (
			<div className="flex h-full items-center justify-center">
				<div className="text-center">
					<Text variant="body1" className="mb-4 text-lg font-semibold">
						Loan not found
					</Text>
					<BackButton onClick={handleBackToLoans} label="Back to Loans" />
				</div>
			</div>
		);
	}

	return (
		<div className="report-print-page flex h-full flex-col gap-2 p-2 md:gap-4 md:p-4">
			<div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
				<div className="flex items-center gap-2">
					<BackButton appearance="icon" onClick={handleBackToLoans} />
					<Text variant="body2" className="text-slate-400">
						Loan Details
					</Text>
				</div>
				<div className="flex items-center gap-2">
					<Button size="sm" variant="secondary" onClick={() => setIsBorrowMoreDialogOpen(true)}>
						Borrow More
					</Button>
					<Button
						size="sm"
						className="bg-sky-600 text-white shadow-sm hover:bg-sky-700"
						onClick={() => {
							setPaymentCode("");
							setPaymentAmount(currentDue ? String(currentDue.amount) : "");
							setShouldUpdateDueDate(true);
							setIsPaymentDialogOpen(true);
						}}
						disabled={!currentDue || isCreatingPayment}
					>
						Create Payment
					</Button>
					<Button
						size="sm"
						variant="outline"
						className="border-slate-300 bg-white text-slate-700 shadow-sm hover:bg-slate-50 hover:text-slate-900"
						onClick={handlePrintPayments}
						disabled={payments.length === 0}
					>
						Print
					</Button>
				</div>
			</div>

			<div className="grid min-h-0 flex-1 grid-cols-1 gap-6 print:hidden lg:grid-cols-3">
				<div className="col-span-1 flex flex-col gap-4 rounded-lg border bg-white p-6 shadow-sm">
					<div className="flex items-center justify-between gap-3 border-b pb-2">
						<Text variant="subTitle1" className="font-semibold">
							Information
						</Text>
						<Button size="sm" variant="secondary" onClick={handleOpenEditTermsDialog} disabled={isLoanComplete}>
							Edit Terms
						</Button>
					</div>
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<Text variant="body2" className="text-slate-500">
								Borrower
							</Text>
							<div className="flex gap-2 text-right">
								<Text variant="body2" className="font-medium">
									{loan.borrowerName}
								</Text>
								<span className="text-slate-400">-</span>
								<Badge variant={loan.borrowerType === "employee" ? "info" : "success"} className="capitalize">
									{loan.borrowerType}
								</Badge>
							</div>
						</div>
						<Separator />
						<div className="flex items-center justify-between">
							<Text variant="body2" className="text-slate-500">
								Principal Amount
							</Text>
							<div className="rounded-md border border-sky-200 px-3 py-1 text-sm font-semibold text-sky-700">
								{formatKHR(loan.principalAmount)}
							</div>
						</div>
						<Separator />
						<div className="flex items-center justify-between">
							<Text variant="body2" className="text-slate-500">
								Next Due Date
							</Text>
							<Text variant="body2" className="text-base font-semibold text-amber-950">
								{currentDue ? formatDisplayDate(currentDue.dueDate) : "-"}
							</Text>
						</div>
						<Separator />
						<div className="flex items-center justify-between">
							<Text variant="body2" className="text-slate-500">
								Next Payment
							</Text>
							<Text variant="body2" className="text-base font-semibold text-amber-950">
								{currentDue ? formatKHR(currentDue.amount) : "-"}
							</Text>
						</div>
						<Separator />
						<div className="flex items-center justify-between">
							<Text variant="body2" className="text-slate-500">
								Installment Amount
							</Text>
							<Text variant="body2" className="font-medium">
								{formatKHR(loan.installmentAmount)}
							</Text>
						</div>
						<Separator />
						<div className="flex items-center justify-between">
							<Text variant="body2" className="text-slate-500">
								Remaining Balance
							</Text>
							<Text variant="body2" className="font-medium">
								{formatKHR(remainingBalance)}
							</Text>
						</div>
						<Separator />
						<div className="flex items-center justify-between">
							<Text variant="body2" className="text-slate-500">
								Loan Status
							</Text>
							<Badge
								variant={loan.status === "complete" ? "success" : loan.status === "due" ? "destructive" : "success"}
							>
								{formatLoanStatusLabel(loan.status)}
							</Badge>
						</div>
						<Separator />
						<div className="flex items-center justify-between">
							<Text variant="body2" className="text-slate-500">
								Due Warning Days
							</Text>
							<Text variant="body2" className="font-medium">
								{loan.dueWarningDays}
							</Text>
						</div>
						<Separator />
						<div className="flex items-center justify-between">
							<Text variant="body2" className="text-slate-500">
								Start Date
							</Text>
							<Text variant="body2" className="font-medium">
								{formatDisplayDate(loan.startDate)}
							</Text>
						</div>
						<Separator />
						<div className="flex items-center justify-between">
							<Text variant="body2" className="text-slate-500">
								Created At
							</Text>
							<Text variant="body2" className="font-medium">
								{formatDisplayDate(loan.createdAt)}
							</Text>
						</div>
					</div>
				</div>

				<div className="col-span-1 flex flex-col rounded-lg border bg-white p-6 shadow-sm lg:col-span-2">
					<div className="mb-4 flex items-center justify-between gap-2">
						<Text variant="subTitle1" className="font-semibold">
							Payment Histories
						</Text>
						{currentDue ? (
							<Button variant="warning" size="sm" onClick={() => setIsPostponeDialogOpen(true)} disabled={isPostponing}>
								{isPostponing ? "Postponing..." : "Postpone Due Date"}
							</Button>
						) : null}
					</div>
					<LoanPaymentsTable payments={payments} onExportReceipt={handleExportPaymentReceipt} />
				</div>
			</div>

			<ReportLayout className="hidden print:flex">
				<ReportTemplateTable
					title="Loan Payment Histories"
					headerContent={printHeaderContent}
					columns={printColumns}
					rows={printRows}
					summaryRows={printSummaryRows}
					timestampText={printTimestamp}
					footerText="Generated from Loan Detail"
				/>
			</ReportLayout>

			<Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
				<DialogContent className="sm:max-w-lg">
					<DialogHeader>
						<DialogTitle>Create Loan Payment</DialogTitle>
						<DialogDescription>Record a payment for this loan.</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 text-sm">
						<div className="rounded-md border bg-slate-50 px-4 py-3">
							<div className="flex items-center justify-between gap-4">
								<span className="text-slate-500">Borrower</span>
								<span className="font-medium text-slate-900">{loan.borrowerName}</span>
							</div>
							<div className="mt-2 flex items-center justify-between gap-4">
								<span className="text-slate-500">Due date</span>
								<span className="font-medium text-slate-900">
									{currentDue ? formatDisplayDate(currentDue.dueDate) : "-"}
								</span>
							</div>
						</div>
						<div className="space-y-1.5">
							<Label htmlFor="loan-payment-code">Payment Code</Label>
							<Input
								id="loan-payment-code"
								type="text"
								value={paymentCode}
								onChange={(event) => setPaymentCode(event.target.value)}
								placeholder="Enter payment code"
								disabled={isCreatingPayment}
							/>
						</div>
						<div className="space-y-1.5">
							<Label htmlFor="loan-payment-amount">Amount</Label>
							<div className="relative">
								<Input
									id="loan-payment-amount"
									type="text"
									inputMode="numeric"
									value={paymentAmount}
									onChange={(event) => setPaymentAmount(event.target.value.replace(/[^\d.]/g, ""))}
									placeholder="Enter amount"
									disabled={isCreatingPayment}
									className="pr-14"
								/>
								<span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs font-medium text-slate-400">
									KHR
								</span>
							</div>
						</div>
						<div className="flex items-start gap-3 rounded-md border px-4 py-3">
							<Checkbox
								id="loan-payment-update-due-date"
								checked={shouldUpdateDueDate}
								onCheckedChange={(checked) => setShouldUpdateDueDate(checked === true)}
							/>
							<div className="space-y-1">
								<Label htmlFor="loan-payment-update-due-date" className="cursor-pointer">
									Update next due date after receiving this payment
								</Label>
								<Text variant="caption" className="leading-5 text-slate-500">
									Use this when the payment should also move the next due date forward.
								</Text>
							</div>
						</div>
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => {
								setIsPaymentDialogOpen(false);
								setShouldUpdateDueDate(true);
								setPaymentCode("");
								setPaymentAmount(currentDue ? String(currentDue.amount) : "");
							}}
							disabled={isCreatingPayment}
						>
							Cancel
						</Button>
						<Button
							onClick={handleCreatePayment}
							disabled={
								!currentDue ||
								isCreatingPayment ||
								!paymentCode.trim() ||
								!Number.isFinite(Number(paymentAmount)) ||
								Number(paymentAmount) <= 0
							}
						>
							{isCreatingPayment ? "Creating..." : "Create Payment"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<Dialog open={isBorrowMoreDialogOpen} onOpenChange={setIsBorrowMoreDialogOpen}>
				<DialogContent className="sm:max-w-lg">
					<DialogHeader>
						<DialogTitle>Add More Borrowed Amount</DialogTitle>
						<DialogDescription>
							Create an additional loan entry for this borrower using the current 30-day payment schedule.
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-3">
						<div className="space-y-1.5">
							<Label htmlFor="borrow-more-amount">Borrowed Amount</Label>
							<Input
								id="borrow-more-amount"
								type="number"
								min={1}
								value={additionalAmount}
								onChange={(event) => setAdditionalAmount(event.target.value)}
								placeholder="Enter amount"
								disabled={isExtendingLoan}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => {
								setIsBorrowMoreDialogOpen(false);
								setAdditionalAmount("");
							}}
							disabled={isExtendingLoan}
						>
							Cancel
						</Button>
						<Button
							onClick={handleBorrowMore}
							disabled={isExtendingLoan || !Number.isFinite(Number(additionalAmount)) || Number(additionalAmount) <= 0}
						>
							{isExtendingLoan ? "Creating..." : "Confirm"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<Dialog open={isPostponeDialogOpen} onOpenChange={setIsPostponeDialogOpen}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Postpone Due Date</DialogTitle>
						<DialogDescription>
							Move the current due date forward for this loan. Use this only when the borrower needs an approved
							extension.
						</DialogDescription>
					</DialogHeader>
					<div className="rounded-md border bg-slate-50 px-4 py-3 text-sm">
						<div className="flex items-center justify-between gap-4">
							<span className="text-slate-500">Borrower</span>
							<span className="font-medium text-slate-900">{loan.borrowerName}</span>
						</div>
						<div className="mt-2 flex items-center justify-between gap-4">
							<span className="text-slate-500">Current due date</span>
							<span className="font-medium text-slate-900">
								{currentDue ? formatDisplayDate(currentDue.dueDate) : "-"}
							</span>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setIsPostponeDialogOpen(false)} disabled={isPostponing}>
							Cancel
						</Button>
						<Button
							variant="warning"
							onClick={async () => {
								await postponeLoan();
								setIsPostponeDialogOpen(false);
							}}
							disabled={isPostponing || !currentDue}
						>
							{isPostponing ? "Postponing..." : "Confirm Postpone"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<Dialog open={isEditTermsDialogOpen} onOpenChange={setIsEditTermsDialogOpen}>
				<DialogContent className="sm:max-w-lg">
					<DialogHeader>
						<DialogTitle>Update Loan Terms</DialogTitle>
						<DialogDescription>Adjust the installment amount and due warning period for this loan.</DialogDescription>
					</DialogHeader>
					<div className="space-y-3">
						<div className="space-y-1.5">
							<Label htmlFor="loan-installment-amount">Installment Amount</Label>
							<Input
								id="loan-installment-amount"
								type="number"
								min={1}
								value={installmentAmountInput}
								onChange={(event) => setInstallmentAmountInput(event.target.value)}
								placeholder="Enter installment amount"
								disabled={isUpdatingLoan}
							/>
						</div>
						<div className="space-y-1.5">
							<Label htmlFor="loan-due-warning-days">Due Warning Days</Label>
							<Input
								id="loan-due-warning-days"
								type="number"
								min={0}
								max={29}
								value={dueWarningDaysInput}
								onChange={(event) => setDueWarningDaysInput(event.target.value)}
								placeholder="Enter due warning days"
								disabled={isUpdatingLoan}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setIsEditTermsDialogOpen(false)} disabled={isUpdatingLoan}>
							Cancel
						</Button>
						<Button
							onClick={handleUpdateLoanTerms}
							disabled={
								isUpdatingLoan ||
								!Number.isFinite(Number(installmentAmountInput)) ||
								Number(installmentAmountInput) <= 0 ||
								!Number.isFinite(Number(dueWarningDaysInput)) ||
								Number(dueWarningDaysInput) < 0 ||
								Number(dueWarningDaysInput) > 29
							}
						>
							{isUpdatingLoan ? "Updating..." : "Save Changes"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<Dialog open={isEditTermsDialogOpen} onOpenChange={setIsEditTermsDialogOpen}>
				<DialogContent className="sm:max-w-lg">
					<DialogHeader>
						<DialogTitle>Update Loan Terms</DialogTitle>
						<DialogDescription>Adjust the installment amount and due warning days for this loan.</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4">
						<div className="space-y-1.5">
							<Label htmlFor="loan-installment-amount">Installment Amount</Label>
							<div className="relative">
								<Input
									id="loan-installment-amount"
									type="text"
									inputMode="numeric"
									value={installmentAmountInput}
									onChange={(event) => setInstallmentAmountInput(event.target.value.replace(/[^\d.]/g, ""))}
									placeholder="Enter installment amount"
									disabled={isUpdatingLoan}
									className="pr-14"
								/>
								<span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs font-medium text-slate-400">
									KHR
								</span>
							</div>
						</div>
						<div className="space-y-1.5">
							<Label htmlFor="loan-due-warning-days">Due Warning Days</Label>
							<Input
								id="loan-due-warning-days"
								type="number"
								min={0}
								max={29}
								value={dueWarningDaysInput}
								onChange={(event) => setDueWarningDaysInput(event.target.value)}
								placeholder="Enter warning days"
								disabled={isUpdatingLoan}
							/>
							<Text variant="caption" className="leading-5 text-slate-500">
								Choose a value from 0 to 29 days before the due date.
							</Text>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setIsEditTermsDialogOpen(false)} disabled={isUpdatingLoan}>
							Cancel
						</Button>
						<Button
							onClick={handleUpdateLoanTerms}
							disabled={
								isUpdatingLoan ||
								!Number.isFinite(Number(installmentAmountInput)) ||
								Number(installmentAmountInput) <= 0 ||
								!Number.isFinite(Number(dueWarningDaysInput)) ||
								Number(dueWarningDaysInput) < 0 ||
								Number(dueWarningDaysInput) > 29
							}
						>
							{isUpdatingLoan ? "Updating..." : "Update Terms"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
