import { useMemo, useState } from "react";
import { useParams } from "react-router";
import { BackButton } from "@/core/components/common";
import { Badge } from "@/core/ui/badge";
import { Button } from "@/core/ui/button";
import { Checkbox } from "@/core/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/core/ui/dialog";
import { Input } from "@/core/ui/input";
import { Label } from "@/core/ui/label";
import { Separator } from "@/core/ui/separator";
import { Text } from "@/core/ui/typography";
import { formatDisplayDate, formatDisplayDateTime, formatKHR } from "@/core/utils/formatters";
import { useRouter } from "@/routes/hooks/use-router";
import { ReportLayout } from "../../reports/components/layout/report-layout";
import {
	type ReportTemplateColumn,
	type ReportTemplateRow,
	type ReportTemplateSummaryRow,
	ReportTemplateTable,
} from "../../reports/components/layout/report-template-table";
import { formatReportTimestamp } from "../../reports/report-detail/constants";
import { LoanPaymentsTable } from "./components/loan-payments-table";
import { type LoanDueWarning, useBorrowDetail } from "./hooks/use-borrow-detail";

function getWarningLabel(warning: LoanDueWarning) {
	if (warning === "overdue") return "Overdue";
	if (warning === "due-soon") return "Due soon";
	return null;
}

function getWarningVariant(warning: LoanDueWarning) {
	if (warning === "overdue") return "destructive";
	if (warning === "due-soon") return "warning";
	return "secondary";
}

function formatLoanStatusLabel(status?: "normal" | "due" | "complete") {
	if (status === "due") return "Due";
	if (status === "complete") return "Complete";
	return "Normal";
}

function buildPaymentExportCsv(
	rows: Array<{ paymentNo: number; paidAt: string; amount: number }>,
	borrowerName: string,
) {
	const header = ["Borrower", "Payment No", "Payment Date", "Amount"];
	const lines = rows.map((row) =>
		[borrowerName, String(row.paymentNo), formatDisplayDateTime(row.paidAt), String(row.amount)].join(","),
	);
	return [header.join(","), ...lines].join("\n");
}

export default function BorrowDetailPage() {
	const { id } = useParams<{ id: string }>();
	const router = useRouter();
	const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
	const [shouldUpdateDueDate, setShouldUpdateDueDate] = useState(true);
	const [isBorrowMoreDialogOpen, setIsBorrowMoreDialogOpen] = useState(false);
	const [additionalAmount, setAdditionalAmount] = useState("");
	const {
		loan,
		isLoading,
		isError,
		payments,
		currentDue,
		dueWarning,
		createPayment,
		isCreatingPayment,
		postponeLoan,
		isPostponing,
		extendLoan,
		isExtendingLoan,
	} = useBorrowDetail(id || "");

	const nextPaymentAmount = currentDue?.amount ?? 0;
	const paidTotal = loan?.paidAmount ?? 0;
	const remainingBalance = loan ? Math.max(loan.principalAmount - paidTotal, 0) : 0;
	const warningLabel =
		dueWarning === "due-soon" ? `Due in ${loan?.dueWarningDays ?? 5} days` : getWarningLabel(dueWarning);
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
					<div className="text-2xl font-bold">Loan Payment History</div>
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

	const handleCreatePayment = async () => {
		if (!currentDue) return;
		await createPayment({
			amount: currentDue.amount,
			shouldUpdateDueDate,
		});
		setIsPaymentDialogOpen(false);
	};

	const handleBorrowMore = async () => {
		const parsedAmount = Number(additionalAmount);
		if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) return;
		await extendLoan(parsedAmount);
		setIsBorrowMoreDialogOpen(false);
		setAdditionalAmount("");
	};

	const handleExportPayments = () => {
		if (!loan || payments.length === 0) return;
		const csv = buildPaymentExportCsv(payments, loan.borrowerName);
		const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
		const url = window.URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = `loan-payments-${loan.borrowerName.replace(/\s+/g, "-").toLowerCase()}.csv`;
		document.body.appendChild(link);
		link.click();
		link.remove();
		window.URL.revokeObjectURL(url);
	};

	const handlePrintPayments = () => {
		if (payments.length === 0) return;
		window.print();
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
					<BackButton onClick={() => router.push("/dashboard/loan")} label="Back to Loans" />
				</div>
			</div>
		);
	}

	return (
		<div className="report-print-page flex h-full flex-col gap-2 p-2 md:gap-4 md:p-4">
			<div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
				<div className="flex items-center gap-2">
					<BackButton appearance="icon" onClick={() => router.push("/dashboard/loan")} />
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
						onClick={() => setIsPaymentDialogOpen(true)}
						disabled={!currentDue || isCreatingPayment}
					>
						Create Payment
					</Button>
					<Button
						size="sm"
						variant="outline"
						className="border-slate-300 bg-white text-slate-700 shadow-sm hover:bg-slate-50 hover:text-slate-900"
						onClick={handleExportPayments}
						disabled={payments.length === 0}
					>
						Export CSV
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
					<Text variant="subTitle1" className="border-b pb-2 font-semibold">
						Information
					</Text>
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
							<Text variant="body2" className="font-medium">
								{formatKHR(loan.principalAmount)}
							</Text>
						</div>
						<Separator />
						<div className="flex items-center justify-between">
							<Text variant="body2" className="text-slate-500">
								Next Due Date
							</Text>
							<Text variant="body2" className="font-medium">
								{currentDue ? formatDisplayDate(currentDue.dueDate) : "-"}
							</Text>
						</div>
						<Separator />
						<div className="flex items-center justify-between">
							<Text variant="body2" className="text-slate-500">
								Next Payment
							</Text>
							<Text variant="body2" className="font-medium">
								{currentDue ? formatKHR(currentDue.amount) : "-"}
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
								variant={loan.status === "complete" ? "success" : loan.status === "due" ? "destructive" : "secondary"}
							>
								{formatLoanStatusLabel(loan.status)}
							</Badge>
						</div>
						{warningLabel ? (
							<>
								<Separator />
								<div className="flex items-center justify-between">
									<Text variant="body2" className="text-slate-500">
										Status
									</Text>
									<Badge variant={getWarningVariant(dueWarning)}>{warningLabel}</Badge>
								</div>
							</>
						) : null}
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
							Payment History
						</Text>
						{currentDue ? (
							<Button variant="warning" size="sm" onClick={() => postponeLoan()} disabled={isPostponing}>
								{isPostponing ? "Postponing..." : "Postpone Due Date"}
							</Button>
						) : null}
					</div>
					<LoanPaymentsTable payments={payments} />
				</div>
			</div>

			<ReportLayout className="hidden print:flex">
				<ReportTemplateTable
					title="Loan Payment History"
					headerContent={printHeaderContent}
					columns={printColumns}
					rows={printRows}
					summaryRows={printSummaryRows}
					timestampText={printTimestamp}
					footerText="Generated from Loan Detail"
				/>
			</ReportLayout>

			<Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Create Loan Payment</DialogTitle>
						<DialogDescription>
							Mark the current loan payment as received. Payments are collected every 30 days.
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-3 text-sm">
						<div className="rounded-md border bg-slate-50 p-3">
							<div>Borrower: {loan.borrowerName}</div>
							<div>Due date: {currentDue ? formatDisplayDate(currentDue.dueDate) : "-"}</div>
							<div>Amount: {formatKHR(nextPaymentAmount)}</div>
						</div>
						<div className="flex items-start gap-3 rounded-md border p-3">
							<Checkbox
								id="loan-payment-update-due-date"
								checked={shouldUpdateDueDate}
								onCheckedChange={(checked) => setShouldUpdateDueDate(checked === true)}
							/>
							<div className="space-y-1">
								<Label htmlFor="loan-payment-update-due-date" className="cursor-pointer">
									Update next due date after receiving this payment
								</Label>
								<Text variant="caption" className="text-slate-500">
									When enabled, the request sends <code>shouldUpdateDueDate: true</code> to
									<code>
										{" "}
										/api/v1/loans/{"{"}loanId{"}"}/pay
									</code>
									.
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
							}}
							disabled={isCreatingPayment}
						>
							Cancel
						</Button>
						<Button onClick={handleCreatePayment} disabled={!currentDue || isCreatingPayment}>
							{isCreatingPayment ? "Creating..." : "Create Payment"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<Dialog open={isBorrowMoreDialogOpen} onOpenChange={setIsBorrowMoreDialogOpen}>
				<DialogContent className="sm:max-w-md">
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
		</div>
	);
}
