import { format, parseISO } from "date-fns";
import type { Loan } from "@/core/types/loan";
import type { BorrowRow } from "../components/borrow-columns";

export function mapLoanToBorrowRow(loan: Loan): BorrowRow {
	const monthlyPayment = loan.termMonths > 0 ? Math.ceil(loan.principalAmount / loan.termMonths) : 0;

	return {
		id: loan.id,
		borrowerType: loan.borrowerType,
		borrowerId: loan.borrowerId,
		principalAmount: loan.principalAmount,
		termMonths: loan.termMonths,
		monthlyPayment,
		startDate: format(parseISO(loan.startDate), "yyyy-MM-dd"),
	};
}
