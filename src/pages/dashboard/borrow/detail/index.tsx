import { BackButton } from "@/core/components/common";
import { Badge } from "@/core/ui/badge";
import { Button } from "@/core/ui/button";
import { Separator } from "@/core/ui/separator";
import { Text } from "@/core/ui/typography";
import type { InvoiceExportPreviewLocationState } from "@/core/types/invoice";
import { formatDisplayDate, formatDisplayDateTime, formatKHR } from "@/core/utils/formatters";
import { useRouter } from "@/routes/hooks/use-router";
import { useCallback, useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { ReportLayout } from "../../reports/components/layout/report-layout";
import {
	type ReportTemplateColumn,
	type ReportTemplateRow,
	type ReportTemplateSummaryRow,
	ReportTemplateTable,
} from "../../reports/components/layout/report-template-table";
import { formatReportTimestamp } from "../../reports/report-detail/constants";
import {
	BorrowMoreDialog,
	CreatePaymentDialog,
	EditLoanTermsDialog,
	PostponeDueDateDialog,
} from "./components/borrow-detail-dialogs";
import { LoanPaymentsTable } from "./components/loan-payments-table";
import { useBorrowDetail } from "./hooks/use-borrow-detail";
import { useBorrowDetailDialogs } from "./hooks/use-borrow-detail-dialogs";

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
		isGeneratingPaymentCode,
		regeneratePaymentCode,
	} = useBorrowDetail(id || "");
	const {
		isPaymentDialogOpen,
		setIsPaymentDialogOpen,
		shouldUpdateDueDate,
		setShouldUpdateDueDate,
		paymentCode,
		setPaymentCodeValue,
		paymentAmount,
		setPaymentAmount,
		isBorrowMoreDialogOpen,
		setIsBorrowMoreDialogOpen,
		additionalAmount,
		setAdditionalAmount,
		isEditTermsDialogOpen,
		setIsEditTermsDialogOpen,
		isPostponeDialogOpen,
		setIsPostponeDialogOpen,
		installmentAmountInput,
		setInstallmentAmountInput,
		dueWarningDaysInput,
		setDueWarningDaysInput,
		applyGeneratedPaymentCode,
		openPaymentDialog,
		openEditTermsDialog,
		handleCreatePayment,
		handleBorrowMore,
		handleUpdateLoanTerms,
		handlePostponeLoan,
		resetPaymentDialog,
		resetBorrowMoreDialog,
	} = useBorrowDetailDialogs({
		currentDue,
		loan,
		createPayment,
		extendLoan,
		updateLoan,
		postponeLoan,
		regeneratePaymentCode,
	});

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
						<div className="mt-1">Memo: {loan?.memo?.trim() || "-"}</div>
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
						onClick={openPaymentDialog}
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
						<Button size="sm" variant="secondary" onClick={openEditTermsDialog} disabled={isLoanComplete}>
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
						<div className="flex items-start justify-between gap-4">
							<Text variant="body2" className="text-slate-500">
								Memo
							</Text>
							<Text variant="body2" className="max-w-[16rem] text-right font-medium whitespace-pre-wrap break-words">
								{loan.memo?.trim() || "-"}
							</Text>
						</div>
						<Separator />
						<div className="flex items-center justify-between">
							<Text variant="body2" className="text-slate-500">
								Created At
							</Text>
							<Text variant="body2" className="font-medium">
								{formatDisplayDateTime(loan.createdAt)}
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

			<CreatePaymentDialog
				open={isPaymentDialogOpen}
				onOpenChange={setIsPaymentDialogOpen}
				borrowerName={loan.borrowerName}
				currentDue={currentDue}
				paymentCode={paymentCode}
				onPaymentCodeChange={setPaymentCodeValue}
				paymentAmount={paymentAmount}
				onPaymentAmountChange={(value) => setPaymentAmount(value.replace(/[^\d.]/g, ""))}
				shouldUpdateDueDate={shouldUpdateDueDate}
				onShouldUpdateDueDateChange={setShouldUpdateDueDate}
				onRegeneratePaymentCode={() => void applyGeneratedPaymentCode(true)}
				onCancel={resetPaymentDialog}
				onSubmit={handleCreatePayment}
				isCreatingPayment={isCreatingPayment}
				isGeneratingPaymentCode={isGeneratingPaymentCode}
			/>

			<BorrowMoreDialog
				open={isBorrowMoreDialogOpen}
				onOpenChange={setIsBorrowMoreDialogOpen}
				additionalAmount={additionalAmount}
				onAdditionalAmountChange={setAdditionalAmount}
				onCancel={resetBorrowMoreDialog}
				onSubmit={handleBorrowMore}
				isExtendingLoan={isExtendingLoan}
			/>

			<PostponeDueDateDialog
				open={isPostponeDialogOpen}
				onOpenChange={setIsPostponeDialogOpen}
				borrowerName={loan.borrowerName}
				currentDue={currentDue}
				onSubmit={handlePostponeLoan}
				isPostponing={isPostponing}
			/>

			<EditLoanTermsDialog
				open={isEditTermsDialogOpen}
				onOpenChange={setIsEditTermsDialogOpen}
				installmentAmountInput={installmentAmountInput}
				onInstallmentAmountInputChange={setInstallmentAmountInput}
				dueWarningDaysInput={dueWarningDaysInput}
				onDueWarningDaysInputChange={setDueWarningDaysInput}
				onSubmit={handleUpdateLoanTerms}
				isUpdatingLoan={isUpdatingLoan}
			/>
		</div>
	);
}
