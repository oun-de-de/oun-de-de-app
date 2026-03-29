export type CycleStatus = "OPEN" | "CLOSED" | "OVERDUE";

export type CycleStatusVariant = "success" | "warning" | "error";
export type CycleStatusCardColor = "bg-green-500" | "bg-amber-500" | "bg-red-500";

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

export function getCycleStatusVariant(status: CycleStatus): CycleStatusVariant {
	switch (status) {
		case "CLOSED":
			return "success";
		case "OPEN":
			return "warning";
		case "OVERDUE":
			return "error";
	}
}

export function getCycleStatusCardColor(status: CycleStatus): CycleStatusCardColor {
	switch (status) {
		case "CLOSED":
			return "bg-green-500";
		case "OPEN":
			return "bg-amber-500";
		case "OVERDUE":
			return "bg-red-500";
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
