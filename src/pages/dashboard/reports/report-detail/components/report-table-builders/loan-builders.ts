import type { Customer } from "@/core/types/customer";
import type { Installment, Loan } from "@/core/types/loan";
import { formatDisplayDate, formatNumber } from "@/core/utils/formatters";
import type { ReportTemplateRow } from "../../../components/layout/report-template-table";

function getLoanPaymentTotals(loan: Loan, installments: Installment[] = []) {
	const collected = installments
		.filter((installment) => installment.status === "paid" || installment.paidAt)
		.reduce((sum, installment) => sum + installment.amount, 0);
	const balance = Math.max(loan.principalAmount - collected, 0);

	return { collected, balance };
}

export function buildCustomerLoanRows(
	loans: Loan[],
	customers: Customer[],
	installmentsByLoanId: Record<string, Installment[]>,
): ReportTemplateRow[] {
	const customerMap = new Map(customers.map((customer) => [customer.id, customer]));
	return loans.map((loan, index) => {
		const customer = customerMap.get(loan.borrowerId);
		const { collected, balance } = getLoanPaymentTotals(loan, installmentsByLoanId[loan.id]);

		return {
			key: loan.id,
			cells: {
				no: index + 1,
				date: formatDisplayDate(loan.createdAt || loan.startDate),
				code: customer?.code ?? loan.borrowerId,
				name: loan.borrowerName,
				reason: "Loan / installment",
				debit: formatNumber(loan.principalAmount),
				credit: formatNumber(collected),
				balance: formatNumber(balance),
				qty: loan.termMonths,
				paymentTerm: `${loan.termMonths} months`,
				other: loan.monthlyPayment > 0 ? `${formatNumber(loan.monthlyPayment)}/month` : "-",
			},
		};
	});
}

export function buildEmployeeLoanRows(
	loans: Loan[],
	installmentsByLoanId: Record<string, Installment[]>,
): ReportTemplateRow[] {
	return loans.map((loan, index) => {
		const { collected, balance } = getLoanPaymentTotals(loan, installmentsByLoanId[loan.id]);

		return {
			key: loan.id,
			cells: {
				date: formatDisplayDate(loan.createdAt || loan.startDate),
				type: "General Employee",
				refNo: `${String(index + 1).padStart(5, "0")}-${loan.borrowerId}`,
				employee: loan.borrowerName,
				memo: `${loan.borrowerName} loan account`,
				name: "",
				debit: formatNumber(loan.principalAmount),
				credit: formatNumber(collected),
				balance: formatNumber(balance),
			},
		};
	});
}
