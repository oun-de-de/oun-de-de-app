export type CycleStatus = "OPEN" | "CLOSED" | "OVERDUE";

export const CYCLE_STATUS_OPTIONS = [
	{ value: "all", label: "All Status" },
	{ value: "OPEN", label: "Open" },
	{ value: "CLOSED", label: "Closed" },
	{ value: "OVERDUE", label: "Overdue" },
] as const;

export function getCycleStatusLabel(status: CycleStatus): string {
	switch (status) {
		case "OPEN":
			return "Open";
		case "CLOSED":
			return "Closed";
		case "OVERDUE":
			return "Overdue";
	}
}

export interface Cycle {
	id: string;
	customerId: string;
	customerName: string;
	startDate: string;
	endDate: string;
	status: CycleStatus;
	totalAmount?: number;
	totalPaidAmount?: number;
}

export interface CyclePayment {
	id: string;
	cycleId: string;
	code?: string;
	paymentDate: string;
	amount: number;
}

export interface CreatePaymentRequest {
	code: string;
	paymentDate: string;
	amount: number;
}

export interface ConvertToLoanRequest {
	loanInstallmentAmount: number;
	startDate: string;
	dueWarningDays?: number;
}
