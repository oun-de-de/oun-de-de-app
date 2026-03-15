export type BorrowerType = "employee" | "customer";

export type InstallmentStatus = "unpaid" | "overdue" | "paid";
export type LoanStatus = "normal" | "due" | "complete";

export type Loan = {
	id: string;
	borrowerType: BorrowerType;
	borrowerId: string;
	borrowerName: string;
	principalAmount: number;
	paidAmount: number;
	installmentAmount: number;
	dueWarningDays: number;
	dueDate: string;
	status: LoanStatus;
	startDate: string;
	createdAt: string;
	termMonths?: number;
	monthlyPayment?: number;
};

export type Installment = {
	id: string;
	loanId: string;
	monthIndex: number;
	dueDate: string;
	amount: number;
	status: InstallmentStatus;
	paidAt: string | null;
};

export type CreateLoanRequest = {
	borrowerType: BorrowerType;
	borrowerId: string;
	principalAmount: number;
	loanInstallmentAmount: number;
	dueWarningDays?: number;
	startDate: string;
};

export type LoanPayment = {
	id: string;
	paymentDate: string;
	amount: number;
};

export type CreateLoanPaymentRequest = {
	paymentDate?: string;
	amount: number;
	shouldUpdateDueDate: boolean;
};

export type ExtendLoanRequest = {
	amount: number;
};

export type UpdateLoanRequest = {
	installmentAmount?: number;
	dueWarningDays?: number;
};
