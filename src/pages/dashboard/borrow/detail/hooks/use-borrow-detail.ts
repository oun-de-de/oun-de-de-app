import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import loanService from "@/core/api/services/loan-service";
import type { CreateLoanPaymentRequest, Loan, LoanPayment, UpdateLoanRequest } from "@/core/types/loan";
import { getTodayUTC, toUtcIsoPreferNowIfToday } from "@/core/utils/date-utils";

export type LoanDueWarning = "due-soon" | "overdue" | null;

export type LoanPaymentRecord = {
	id: string;
	paymentNo: number;
	amount: number;
	paidAt: string;
};

export type CurrentLoanDue = {
	dueDate: string;
	amount: number;
};

function getDaysUntil(dateString: string) {
	const now = new Date();
	const target = new Date(dateString);
	const diff = target.getTime() - now.getTime();
	return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function toPaymentRecords(payments: LoanPayment[]): LoanPaymentRecord[] {
	const sortedPayments = [...payments].sort(
		(left, right) => new Date(right.paymentDate).getTime() - new Date(left.paymentDate).getTime(),
	);

	return sortedPayments.map((payment, index) => ({
		id: payment.id,
		paymentNo: sortedPayments.length - index,
		amount: payment.amount,
		paidAt: payment.paymentDate,
	}));
}

export function useBorrowDetail(loanId: string) {
	const queryClient = useQueryClient();

	const loanQuery = useQuery<Loan>({
		queryKey: ["loan-details", loanId],
		queryFn: () => loanService.getLoanDetails(loanId),
		enabled: !!loanId,
	});

	const loanPaymentsQuery = useQuery<LoanPayment[]>({
		queryKey: ["loan-payments", loanId],
		queryFn: () => loanService.listLoanPayments(loanId),
		enabled: !!loanId,
	});

	const payments = toPaymentRecords(loanPaymentsQuery.data ?? []);
	const currentDue: CurrentLoanDue | null =
		loanQuery.data && loanQuery.data.status !== "complete"
			? {
					dueDate: loanQuery.data.dueDate,
					amount: loanQuery.data.installmentAmount,
				}
			: null;

	const dueWarning: LoanDueWarning = (() => {
		if (!loanQuery.data || !currentDue) return null;
		if (loanQuery.data.status === "complete") return null;
		if (loanQuery.data.status === "due") return "overdue";
		const daysUntilDue = getDaysUntil(currentDue.dueDate);
		if (daysUntilDue < 0) return "overdue";
		if (daysUntilDue <= (loanQuery.data.dueWarningDays || 5)) return "due-soon";
		return null;
	})();

	const invalidateLoanQueries = () => {
		queryClient.invalidateQueries({ queryKey: ["loan-payments", loanId] });
		queryClient.invalidateQueries({ queryKey: ["loan-details", loanId] });
		queryClient.invalidateQueries({ queryKey: ["loans"] });
	};

	const { mutateAsync: createPayment, isPending: isCreatingPayment } = useMutation({
		mutationFn: (data: Omit<CreateLoanPaymentRequest, "paymentDate"> & { paymentDate?: string }) =>
			loanService.createPayment(loanId, {
				...data,
				paymentDate: data.paymentDate ?? toUtcIsoPreferNowIfToday(getTodayUTC()) ?? new Date().toISOString(),
			}),
		onSuccess: () => {
			toast.success("Loan payment created successfully");
			invalidateLoanQueries();
		},
		onError: (error) => {
			toast.error("Failed to create payment");
			console.error("Loan payment error:", error);
		},
	});

	const { mutateAsync: postponeLoan, isPending: isPostponing } = useMutation({
		mutationFn: () => loanService.postponeLoan(loanId),
		onSuccess: () => {
			toast.success("Loan due date postponed successfully");
			invalidateLoanQueries();
		},
		onError: (error) => {
			toast.error("Failed to postpone loan");
			console.error("Postpone error:", error);
		},
	});

	const { mutateAsync: extendLoan, isPending: isExtendingLoan } = useMutation({
		mutationFn: (amount: number) => loanService.extendLoan(loanId, { amount }),
		onSuccess: () => {
			toast.success("Loan amount extended successfully");
			invalidateLoanQueries();
		},
		onError: (error) => {
			toast.error("Failed to extend loan");
			console.error("Extend loan error:", error);
		},
	});

	const { mutateAsync: updateLoan, isPending: isUpdatingLoan } = useMutation({
		mutationFn: (data: UpdateLoanRequest) => loanService.updateLoan(loanId, data),
		onSuccess: () => {
			toast.success("Loan updated successfully");
			invalidateLoanQueries();
		},
		onError: (error) => {
			toast.error("Failed to update loan");
			console.error("Update loan error:", error);
		},
	});

	return {
		loan: loanQuery.data,
		isLoading: loanQuery.isLoading || loanPaymentsQuery.isLoading,
		isError: loanQuery.isError || loanPaymentsQuery.isError,
		payments,
		currentDue,
		dueWarning,
		createPayment,
		isCreatingPayment,
		postponeLoan,
		isPostponing,
		extendLoan,
		isExtendingLoan,
		updateLoan,
		isUpdatingLoan,
	};
}
