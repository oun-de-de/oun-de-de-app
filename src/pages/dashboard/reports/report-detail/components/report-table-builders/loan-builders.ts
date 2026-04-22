import type { Customer } from "@/core/types/customer";
import type { Installment, Loan } from "@/core/types/loan";
import { formatFlexibleDisplayDate } from "@/core/utils/date-display";
import { formatNumber } from "@/core/utils/formatters";
import type { ReportTemplateRow } from "../../../components/layout/report-template-table";
import { createIndexedReportRow, createLedgerCells, createReportRow } from "./report-row-helpers";

function getLoanPaymentTotals(loan: Loan, installments: Installment[] = []) {
	const collected =
		installments.length > 0
			? installments
					.filter((installment) => installment.status === "paid" || installment.paidAt)
					.reduce((sum, installment) => sum + installment.amount, 0)
			: (loan.paidAmount ?? 0);
	const balance = Math.max(loan.principalAmount - collected, 0);

	return { collected, balance };
}

function getInstallmentSummary(loan: Loan, installments: Installment[] = []) {
	if (installments.length === 0) {
		return {
			hasDetailedSchedule: false,
			paidCount: null,
			overdueCount: loan.status === "due" ? null : 0,
			nextDue: loan.status === "complete" ? "-" : formatFlexibleDisplayDate(loan.dueDate),
		};
	}

	const paidCount = installments.filter((installment) => installment.status === "paid" || installment.paidAt).length;
	const overdueCount = installments.filter((installment) => installment.status === "overdue").length;
	const nextDue = installments
		.filter((installment) => installment.status !== "paid" && !installment.paidAt)
		.sort((left, right) => left.monthIndex - right.monthIndex)[0];

	return {
		hasDetailedSchedule: true,
		paidCount,
		overdueCount,
		nextDue: nextDue ? formatFlexibleDisplayDate(nextDue.dueDate) : "-",
	};
}

function getCustomerLoanPurpose(loan: Loan, customer?: Customer) {
	const termMonths = loan.termMonths ?? 0;
	if (termMonths >= 12) return "Vehicle or long-term equipment purchase";
	if (termMonths >= 6) return "Tank or equipment purchase";
	if (customer?.name) return `Customer financing for ${customer.name}`;
	return "Customer loan / installment";
}

function formatLoanTerm(termMonths: number) {
	return termMonths > 0 ? `${termMonths} months` : "-";
}

function getCustomerPaymentTerm(loan: Loan, installments: Installment[] = []) {
	const { hasDetailedSchedule, paidCount, overdueCount, nextDue } = getInstallmentSummary(loan, installments);
	const termMonths = loan.termMonths ?? installments.length ?? 0;
	if (!hasDetailedSchedule) {
		return formatLoanTerm(termMonths);
	}

	const parts = [formatLoanTerm(termMonths), `Next due ${nextDue}`];
	if (hasDetailedSchedule && paidCount != null) {
		parts.splice(1, 0, `Paid ${paidCount}/${Math.max(termMonths, installments.length || 0)}`);
	}
	if (overdueCount && overdueCount > 0) {
		parts.push(`Overdue ${overdueCount}`);
	}
	return parts.join(" | ");
}

function getCustomerOtherText(loan: Loan, installments: Installment[] = []) {
	const { hasDetailedSchedule, overdueCount } = getInstallmentSummary(loan, installments);
	const monthlyPayment = loan.monthlyPayment ?? 0;
	const monthlyText = monthlyPayment > 0 ? `${formatNumber(monthlyPayment)}/month` : "-";
	if (!hasDetailedSchedule) return monthlyText;
	if (overdueCount && overdueCount > 0) return `${monthlyText} | ${overdueCount} overdue`;
	return monthlyText;
}

function getEmployeeLoanMemo(loan: Loan, installments: Installment[] = []) {
	const { hasDetailedSchedule, paidCount, nextDue } = getInstallmentSummary(loan, installments);
	return hasDetailedSchedule && paidCount != null
		? `${loan.borrowerName} loan account | Paid ${paidCount} installments | Next due ${nextDue}`
		: `${loan.borrowerName} loan account`;
}

export function buildCustomerLoanRows(
	loans: Loan[],
	customers: Customer[],
	installmentsByLoanId: Record<string, Installment[]>,
): ReportTemplateRow[] {
	const customerMap = new Map(customers.map((customer) => [customer.id, customer]));
	return loans.map((loan, index) => {
		const customer = customerMap.get(loan.borrowerId);
		const installments = installmentsByLoanId[loan.id] ?? [];
		const { collected, balance } = getLoanPaymentTotals(loan, installments);

		return createIndexedReportRow(loan.id, index, {
			date: formatFlexibleDisplayDate(loan.createdAt || loan.startDate),
			code: customer?.code ?? loan.borrowerId,
			name: loan.borrowerName,
			reason: getCustomerLoanPurpose(loan, customer),
			debit: formatNumber(loan.principalAmount),
			credit: formatNumber(collected),
			balance: formatNumber(balance),
			qty: loan.termMonths ?? 0,
			paymentTerm: getCustomerPaymentTerm(loan, installments),
			other: getCustomerOtherText(loan, installments),
		});
	});
}

export function buildEmployeeLoanRows(
	loans: Loan[],
	installmentsByLoanId: Record<string, Installment[]>,
): ReportTemplateRow[] {
	return loans.map((loan, index) => {
		const installments = installmentsByLoanId[loan.id] ?? [];
		const { collected, balance } = getLoanPaymentTotals(loan, installments);

		return createReportRow(
			loan.id,
			createLedgerCells({
				date: formatFlexibleDisplayDate(loan.createdAt || loan.startDate),
				refNo: `${String(index + 1).padStart(5, "0")}-${loan.borrowerId}`,
				type: "General Employee",
				name: "",
				memo: getEmployeeLoanMemo(loan, installments),
				debit: formatNumber(loan.principalAmount),
				credit: formatNumber(collected),
				balance: formatNumber(balance),
				extraCells: {
					employee: loan.borrowerName,
				},
			}),
		);
	});
}
