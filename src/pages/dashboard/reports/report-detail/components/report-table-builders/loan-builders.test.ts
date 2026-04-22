import type { Customer } from "@/core/types/customer";
import type { Installment, Loan } from "@/core/types/loan";
import { buildCustomerLoanRows, buildEmployeeLoanRows } from "./loan-builders";

const customerFixture: Customer = {
	id: "customer-1",
	registerDate: "2025-01-01",
	code: "CUS-001",
	name: "Dara",
	status: true,
	defaultPrice: "",
	warehouseId: "",
	memo: "",
	profileUrl: "",
	shopBannerUrl: "",
	employeeId: "",
	telephone: "",
	email: "",
	geography: "",
	address: "",
	location: "",
	map: "",
	billingAddress: "",
	deliveryAddress: "",
	vehicles: [],
};

const customerLoanFixture: Loan = {
	id: "loan-customer-1",
	borrowerType: "customer",
	borrowerId: "customer-1",
	borrowerName: "Dara",
	principalAmount: 2400,
	paidAmount: 200,
	installmentAmount: 200,
	dueDate: "2025-06-15",
	dueWarningDays: 3,
	startDate: "2025-01-01",
	createdAt: "2025-01-02",
	status: "normal",
	termMonths: 12,
	monthlyPayment: 200,
};

const employeeLoanFixture: Loan = {
	id: "loan-employee-1",
	borrowerType: "employee",
	borrowerId: "emp-01",
	borrowerName: "Vanna",
	principalAmount: 1000,
	paidAmount: 100,
	installmentAmount: 100,
	dueDate: "2025-05-15",
	dueWarningDays: 5,
	startDate: "2025-03-01",
	createdAt: "2025-03-02",
	status: "normal",
};

describe("loan report builders", () => {
	it("builds customer loan rows with financing purpose, paid progress, and overdue summary", () => {
		const installments: Installment[] = [
			{
				id: "ins-1",
				loanId: "loan-customer-1",
				monthIndex: 1,
				amount: 200,
				dueDate: "2025-02-15",
				status: "paid",
				paidAt: "2025-02-14",
			},
			{
				id: "ins-2",
				loanId: "loan-customer-1",
				monthIndex: 2,
				amount: 200,
				dueDate: "2025-03-15",
				status: "overdue",
				paidAt: null,
			},
			{
				id: "ins-3",
				loanId: "loan-customer-1",
				monthIndex: 3,
				amount: 200,
				dueDate: "2025-04-15",
				status: "unpaid",
				paidAt: null,
			},
		];

		const [row] = buildCustomerLoanRows([customerLoanFixture], [customerFixture], {
			[customerLoanFixture.id]: installments,
		});

		expect(row.key).toBe(customerLoanFixture.id);
		expect(row.cells.code).toBe("CUS-001");
		expect(row.cells.reason).toBe("Vehicle or long-term equipment purchase");
		expect(row.cells.credit).toBe("200");
		expect(row.cells.balance).toBe("2,200");
		expect(row.cells.paymentTerm).toBe("12 months | Paid 1/12 | Next due 15/03/2025 | Overdue 1");
		expect(row.cells.other).toBe("200/month | 1 overdue");
	});

	it("builds employee loan rows with generated ledger reference and next due memo", () => {
		const installments: Installment[] = [
			{
				id: "emp-ins-1",
				loanId: "loan-employee-1",
				monthIndex: 1,
				amount: 250,
				dueDate: "2025-04-15",
				status: "paid",
				paidAt: "2025-04-16",
			},
			{
				id: "emp-ins-2",
				loanId: "loan-employee-1",
				monthIndex: 2,
				amount: 250,
				dueDate: "2025-05-15",
				status: "unpaid",
				paidAt: null,
			},
		];

		const [row] = buildEmployeeLoanRows([employeeLoanFixture], {
			[employeeLoanFixture.id]: installments,
		});

		expect(row.key).toBe(employeeLoanFixture.id);
		expect(row.cells.refNo).toBe("00001-emp-01");
		expect(row.cells.type).toBe("General Employee");
		expect(row.cells.employee).toBe("Vanna");
		expect(row.cells.credit).toBe("250");
		expect(row.cells.balance).toBe("750");
		expect(row.cells.memo).toBe("Vanna loan account | Paid 1 installments | Next due 15/05/2025");
	});

	it("keeps loan report text neutral when no detailed installment schedule is available", () => {
		const [customerRow] = buildCustomerLoanRows([{ ...customerLoanFixture, status: "due" }], [customerFixture], {
			[customerLoanFixture.id]: [],
		});
		const [employeeRow] = buildEmployeeLoanRows([{ ...employeeLoanFixture, status: "due" }], {
			[employeeLoanFixture.id]: [],
		});

		expect(customerRow.cells.paymentTerm).toBe("12 months");
		expect(customerRow.cells.other).toBe("200/month");
		expect(employeeRow.cells.memo).toBe("Vanna loan account");
	});
});
