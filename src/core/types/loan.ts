export type BorrowerType = "employee" | "customer";

export type InstallmentStatus = "unpaid" | "overdue" | "paid";

export type Loan = {
	id: string;
	borrowerType: BorrowerType;
	borrowerId: string;
	principalAmount: number;
	termMonths: number;
	startDate: string;
	createdAt: string;
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
	termMonths: number;
	startDate: string;
};
