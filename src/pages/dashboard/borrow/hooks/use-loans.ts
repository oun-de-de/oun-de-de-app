import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import employeeService from "@/core/api/services/employee-service";
import loanService from "@/core/api/services/loan-service";
import { EMPLOYEE_QUERY_KEYS } from "@/core/query-keys/employee-query-keys";
import type {
	BorrowerType,
	CreateLoanPaymentRequest,
	CreateLoanRequest,
	ExtendLoanRequest,
	Loan,
	UpdateLoanRequest,
} from "@/core/types/loan";
import { getEmployeeDisplayName } from "@/pages/dashboard/employees/utils/employee-utils";

export const LOAN_QUERY_KEYS = {
	loans: (params?: Record<string, unknown>) => ["loans", params] as const,
	loan: (loanId: string) => ["loan", loanId] as const,
	payments: (loanId: string) => ["loan-payments", loanId] as const,
};

function normalizeLoanBorrowerName(
	loan: Loan,
	employeesById: Map<string, { username: string; firstName?: string | null; lastName?: string | null }>,
): Loan {
	if (!loan) return loan;
	if (loan.borrowerType !== "employee") return loan;

	const employee = employeesById.get(loan.borrowerId);
	if (!employee) return loan;

	return {
		...loan,
		borrowerName: getEmployeeDisplayName(employee),
	};
}

export function useLoans(params?: {
	borrower_type?: BorrowerType;
	borrower_id?: string;
	from?: string;
	to?: string;
	page?: number;
	size?: number;
	sort?: string;
}) {
	const loansQuery = useQuery({
		queryKey: LOAN_QUERY_KEYS.loans(params),
		queryFn: () => loanService.getLoans(params),
	});
	const employeesQuery = useQuery({
		queryKey: EMPLOYEE_QUERY_KEYS.list(),
		queryFn: () => employeeService.getEmployeeList(),
	});
	const data = useMemo(() => {
		if (!loansQuery.data) return loansQuery.data;

		const employeesById = new Map((employeesQuery.data ?? []).map((employee) => [employee.id, employee]));
		const content = loansQuery.data.content.map((loan) => normalizeLoanBorrowerName(loan, employeesById));

		return {
			...loansQuery.data,
			content,
		};
	}, [employeesQuery.data, loansQuery.data]);

	return {
		...loansQuery,
		data,
	};
}

export function useLoanDetails(loanId?: string) {
	const loanQuery = useQuery({
		queryKey: LOAN_QUERY_KEYS.loan(loanId ?? ""),
		queryFn: () => loanService.getLoanDetails(loanId ?? ""),
		enabled: !!loanId,
	});
	const employeesQuery = useQuery({
		queryKey: EMPLOYEE_QUERY_KEYS.list(),
		queryFn: () => employeeService.getEmployeeList(),
	});
	const data = useMemo(() => {
		if (!loanQuery.data) return loanQuery.data;

		const employeesById = new Map((employeesQuery.data ?? []).map((employee) => [employee.id, employee]));
		return normalizeLoanBorrowerName(loanQuery.data, employeesById);
	}, [employeesQuery.data, loanQuery.data]);

	return {
		...loanQuery,
		data,
	};
}

export function useCreateLoan() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: CreateLoanRequest) => loanService.createLoan(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["loans"] });
		},
	});
}

export function useLoanPayments(loanId?: string) {
	return useQuery({
		queryKey: LOAN_QUERY_KEYS.payments(loanId ?? ""),
		queryFn: () => loanService.listLoanPayments(loanId ?? ""),
		enabled: !!loanId,
	});
}

export function useCreateLoanPayment(loanId?: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: CreateLoanPaymentRequest) => loanService.createPayment(loanId ?? "", data),
		onSuccess: () => {
			if (loanId) {
				queryClient.invalidateQueries({ queryKey: LOAN_QUERY_KEYS.payments(loanId) });
				queryClient.invalidateQueries({ queryKey: LOAN_QUERY_KEYS.loan(loanId) });
			}
			queryClient.invalidateQueries({ queryKey: ["loans"] });
		},
	});
}

export function usePostponeLoan(loanId?: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: () => loanService.postponeLoan(loanId ?? ""),
		onSuccess: () => {
			if (loanId) {
				queryClient.invalidateQueries({ queryKey: LOAN_QUERY_KEYS.loan(loanId) });
				queryClient.invalidateQueries({ queryKey: LOAN_QUERY_KEYS.payments(loanId) });
			}
			queryClient.invalidateQueries({ queryKey: ["loans"] });
		},
	});
}

export function useExtendLoan(loanId?: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: ExtendLoanRequest) => loanService.extendLoan(loanId ?? "", data),
		onSuccess: () => {
			if (loanId) {
				queryClient.invalidateQueries({ queryKey: LOAN_QUERY_KEYS.loan(loanId) });
				queryClient.invalidateQueries({ queryKey: LOAN_QUERY_KEYS.payments(loanId) });
			}
			queryClient.invalidateQueries({ queryKey: ["loans"] });
		},
	});
}

export function useUpdateLoan(loanId?: string) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: UpdateLoanRequest) => loanService.updateLoan(loanId ?? "", data),
		onSuccess: () => {
			if (loanId) {
				queryClient.invalidateQueries({ queryKey: LOAN_QUERY_KEYS.loan(loanId) });
				queryClient.invalidateQueries({ queryKey: LOAN_QUERY_KEYS.payments(loanId) });
			}
			queryClient.invalidateQueries({ queryKey: ["loans"] });
		},
	});
}
