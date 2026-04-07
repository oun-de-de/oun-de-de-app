import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/core/ui/button";
import { Checkbox } from "@/core/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/core/ui/dialog";
import { Input } from "@/core/ui/input";
import { Label } from "@/core/ui/label";
import { Text } from "@/core/ui/typography";
import { formatDisplayDate } from "@/core/utils/formatters";
import type { CurrentLoanDue } from "../hooks/use-borrow-detail";

type CreatePaymentDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	borrowerName: string;
	currentDue: CurrentLoanDue | null;
	paymentCode: string;
	onPaymentCodeChange: (value: string) => void;
	paymentAmount: string;
	onPaymentAmountChange: (value: string) => void;
	shouldUpdateDueDate: boolean;
	onShouldUpdateDueDateChange: (checked: boolean) => void;
	onRegeneratePaymentCode: () => void;
	onCancel: () => void;
	onSubmit: () => void;
	isCreatingPayment: boolean;
	isGeneratingPaymentCode: boolean;
};

export function CreatePaymentDialog({
	open,
	onOpenChange,
	borrowerName,
	currentDue,
	paymentCode,
	onPaymentCodeChange,
	paymentAmount,
	onPaymentAmountChange,
	shouldUpdateDueDate,
	onShouldUpdateDueDateChange,
	onRegeneratePaymentCode,
	onCancel,
	onSubmit,
	isCreatingPayment,
	isGeneratingPaymentCode,
}: CreatePaymentDialogProps) {
	return (
		<Dialog open={open} onOpenChange={isCreatingPayment ? undefined : onOpenChange}>
			<DialogContent className="sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>Create Loan Payment</DialogTitle>
					<DialogDescription>Record a payment for this loan.</DialogDescription>
				</DialogHeader>
				<div className="grid gap-4 text-sm">
					<div className="rounded-md border bg-slate-50 px-4 py-3">
						<div className="flex items-center justify-between gap-4">
							<span className="text-slate-500">Borrower</span>
							<span className="font-medium text-slate-900">{borrowerName}</span>
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
						<div className="relative group">
							<Input
								id="loan-payment-code"
								type="text"
								value={paymentCode}
								onChange={(event) => onPaymentCodeChange(event.target.value)}
								placeholder="Enter payment code"
								disabled={isCreatingPayment || isGeneratingPaymentCode}
								className="pr-10"
							/>
							<button
								type="button"
								onClick={onRegeneratePaymentCode}
								disabled={isCreatingPayment || isGeneratingPaymentCode}
								className="absolute right-2 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus:ring-1 focus:ring-slate-200 disabled:opacity-50"
								title="Regenerate code"
							>
								{isGeneratingPaymentCode ? (
									<Loader2 className="h-4 w-4 animate-spin text-sky-600" />
								) : (
									<RefreshCw className="h-4 w-4 transition-transform group-hover:rotate-180 duration-500" />
								)}
							</button>
						</div>
					</div>

					<div className="space-y-1.5">
						<Label htmlFor="loan-payment-amount">Amount</Label>
						<div className="relative">
							<Input
								id="loan-payment-amount"
								type="text"
								inputMode="numeric"
								value={paymentAmount}
								onChange={(event) => onPaymentAmountChange(event.target.value)}
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
							onCheckedChange={(checked) => onShouldUpdateDueDateChange(checked === true)}
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
					<Button variant="outline" onClick={onCancel} disabled={isCreatingPayment}>
						Cancel
					</Button>
					<Button
						onClick={onSubmit}
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
	);
}

type BorrowMoreDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	additionalAmount: string;
	onAdditionalAmountChange: (value: string) => void;
	onCancel: () => void;
	onSubmit: () => void;
	isExtendingLoan: boolean;
};

export function BorrowMoreDialog({
	open,
	onOpenChange,
	additionalAmount,
	onAdditionalAmountChange,
	onCancel,
	onSubmit,
	isExtendingLoan,
}: BorrowMoreDialogProps) {
	return (
		<Dialog open={open} onOpenChange={isExtendingLoan ? undefined : onOpenChange}>
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
							onChange={(event) => onAdditionalAmountChange(event.target.value)}
							placeholder="Enter amount"
							disabled={isExtendingLoan}
						/>
					</div>
				</div>
				<DialogFooter>
					<Button variant="outline" onClick={onCancel} disabled={isExtendingLoan}>
						Cancel
					</Button>
					<Button
						onClick={onSubmit}
						disabled={isExtendingLoan || !Number.isFinite(Number(additionalAmount)) || Number(additionalAmount) <= 0}
					>
						{isExtendingLoan ? "Creating..." : "Confirm"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

type PostponeDueDateDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	borrowerName: string;
	currentDue: CurrentLoanDue | null;
	onSubmit: () => void;
	isPostponing: boolean;
};

export function PostponeDueDateDialog({
	open,
	onOpenChange,
	borrowerName,
	currentDue,
	onSubmit,
	isPostponing,
}: PostponeDueDateDialogProps) {
	return (
		<Dialog open={open} onOpenChange={isPostponing ? undefined : onOpenChange}>
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
						<span className="font-medium text-slate-900">{borrowerName}</span>
					</div>
					<div className="mt-2 flex items-center justify-between gap-4">
						<span className="text-slate-500">Current due date</span>
						<span className="font-medium text-slate-900">{currentDue ? formatDisplayDate(currentDue.dueDate) : "-"}</span>
					</div>
				</div>
				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPostponing}>
						Cancel
					</Button>
					<Button variant="warning" onClick={onSubmit} disabled={isPostponing || !currentDue}>
						{isPostponing ? "Postponing..." : "Confirm Postpone"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

type EditLoanTermsDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	installmentAmountInput: string;
	onInstallmentAmountInputChange: (value: string) => void;
	dueWarningDaysInput: string;
	onDueWarningDaysInputChange: (value: string) => void;
	onSubmit: () => void;
	isUpdatingLoan: boolean;
};

export function EditLoanTermsDialog({
	open,
	onOpenChange,
	installmentAmountInput,
	onInstallmentAmountInputChange,
	dueWarningDaysInput,
	onDueWarningDaysInputChange,
	onSubmit,
	isUpdatingLoan,
}: EditLoanTermsDialogProps) {
	return (
		<Dialog open={open} onOpenChange={isUpdatingLoan ? undefined : onOpenChange}>
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
							onChange={(event) => onInstallmentAmountInputChange(event.target.value)}
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
							onChange={(event) => onDueWarningDaysInputChange(event.target.value)}
							placeholder="Enter due warning days"
							disabled={isUpdatingLoan}
						/>
					</div>
				</div>
				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)} disabled={isUpdatingLoan}>
						Cancel
					</Button>
					<Button
						onClick={onSubmit}
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
	);
}
