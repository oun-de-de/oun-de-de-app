import { useState } from "react";
import type { Cycle } from "@/core/types/cycle";

export function useCyclePaymentState(params: {
	cycle: Cycle | null;
	payments: any[];
	historyOnly: boolean;
	isLoadingPayments: boolean;
	isCreatingPayment: boolean;
	isConvertingToLoan: boolean;
}) {
	const { cycle, payments, historyOnly, isLoadingPayments, isCreatingPayment, isConvertingToLoan } = params;

	//UI Form State
	const [activeTab, setActiveTab] = useState("payment");
	const [amount, setAmount] = useState("");
	const [paymentDateTime, setPaymentDateTime] = useState("");
	const [monthlyAmount, setMonthlyAmount] = useState("");
	const [loanStartDate, setLoanStartDate] = useState("");

	//Pagination State for Payment History
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);

	//Derived Helper Variables & Flags
	const hasCycle = cycle !== null;
	const isBusy = isCreatingPayment || isConvertingToLoan;

	//Pagination Calculations
	const totalPages = Math.ceil(payments.length / pageSize) || 1;
	const pagedData = payments.slice((page - 1) * pageSize, page * pageSize);

	//Financial Balance Calculations
	const totalPaidAmount = isLoadingPayments
		? (cycle?.totalPaidAmount ?? 0)
		: payments.reduce((sum, payment) => sum + (payment.amount ?? 0), 0);
	const cycleBalance = Math.max(0, (cycle?.totalAmount ?? 0) - totalPaidAmount);

	//Form Validation Logic
	//Payment Amount Validation
	const parsedAmount = Number(amount);
	const hasValidAmount = Number.isFinite(parsedAmount) && parsedAmount > 0;
	const isAmountExceeded = hasValidAmount && parsedAmount > cycleBalance;
	const canSubmit = !historyOnly && hasCycle && !isBusy && hasValidAmount && !isAmountExceeded;

	//Loan Conversion Validation
	const parsedMonthlyAmount = Number(monthlyAmount);
	const hasValidMonthlyAmount = Number.isFinite(parsedMonthlyAmount) && parsedMonthlyAmount > 0;
	const canConvertToLoan = !historyOnly && hasCycle && cycleBalance > 0 && hasValidMonthlyAmount && !isBusy;

	//Expose State and Derived Values
	return {
		state: { activeTab, amount, paymentDateTime, monthlyAmount, loanStartDate, page, pageSize },
		setters: { setActiveTab, setAmount, setPaymentDateTime, setMonthlyAmount, setLoanStartDate, setPage, setPageSize },
		derived: {
			hasCycle,
			hasValidAmount,
			hasValidMonthlyAmount,
			isBusy,
			totalPages,
			pagedData,
			totalPaidAmount,
			cycleBalance,
			parsedAmount,
			parsedMonthlyAmount,
			canSubmit,
			canConvertToLoan,
			isAmountExceeded,
		},
	};
}
