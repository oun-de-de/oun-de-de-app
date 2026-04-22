import type { ButtonHTMLAttributes, ReactNode } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import CreateExpensePage from "./create-expense-page";

const navigateMock = vi.fn();
const mutateAsyncMock = vi.fn();

vi.mock("react-router", async () => {
	const actual = await vi.importActual<typeof import("react-router")>("react-router");
	return {
		...actual,
		Link: ({ children, to }: { children: ReactNode; to: string }) => <a href={to}>{children}</a>,
		useNavigate: () => navigateMock,
	};
});

vi.mock("sonner", () => ({
	toast: {
		success: vi.fn(),
		error: vi.fn(),
	},
}));

vi.mock("@/core/components/common", () => ({
	BackButton: ({ onClick }: { onClick: () => void }) => (
		<button type="button" onClick={onClick}>
			Back
		</button>
	),
	SplitButton: ({
		mainAction,
		options,
	}: {
		mainAction: { label: string; onClick: () => void; disabled?: boolean };
		options: Array<{ label: string; onClick: () => void; disabled?: boolean }>;
	}) => (
		<div>
			<button type="button" disabled={mainAction.disabled} onClick={mainAction.onClick}>
				{mainAction.label}
			</button>
			{options.map((option) => (
				<button key={option.label} type="button" disabled={option.disabled} onClick={option.onClick}>
					{option.label}
				</button>
			))}
		</div>
	),
}));

vi.mock("@/core/ui/button", () => ({
	Button: ({
		children,
		asChild: _asChild,
		...props
	}: ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }) => (
		<button {...props}>{children}</button>
	),
}));

vi.mock("@/core/ui/card", () => ({
	Card: ({ children }: { children: ReactNode }) => <div>{children}</div>,
	CardHeader: ({ children }: { children: ReactNode }) => <div>{children}</div>,
	CardTitle: ({ children }: { children: ReactNode }) => <div>{children}</div>,
	CardContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock("../hooks/use-accounting-reference-data", () => ({
	useAccountingReferenceData: () => ({
		chartAccounts: [{ id: "acc-1", code: "5000", name: "Fuel", accountType: { id: "type-1", code: "EXP", name: "Expense" } }],
		customerOptions: [{ value: "customer-1", label: "CUS-001 : Dara" }],
		employeeOptions: [{ value: "employee-1", label: "Admin User" }],
		journalClassOptions: [],
		isLoading: false,
	}),
}));

vi.mock("@/pages/dashboard/settings/hooks/use-settings", () => ({
	useGetCurrencyList: () => ({
		data: [{ id: "currency-1", name: "USD" }],
		isLoading: false,
	}),
}));

vi.mock("@/pages/dashboard/accounting-center/hooks/use-create-cash-transaction", () => ({
	useCreateCashTransaction: () => ({
		mutateAsync: mutateAsyncMock,
		isPending: false,
	}),
}));

vi.mock("../components/cash-transaction-form-header", () => ({
	CashTransactionFormHeader: ({ form }: { form: { register: (name: string) => Record<string, unknown> } }) => (
		<div>
			<input aria-label="Ref No" {...form.register("refNo")} />
			<input aria-label="Date" {...form.register("date")} />
			<input aria-label="Currency" {...form.register("currencyId")} />
			<input aria-label="Employee" {...form.register("employeeId")} />
			<textarea aria-label="Memo" {...form.register("memo")} />
		</div>
	),
}));

vi.mock("../components/cash-transaction-details-table", () => ({
	CashTransactionDetailsTable: ({
		form,
	}: {
		form: { register: (name: string, options?: Record<string, unknown>) => Record<string, unknown> };
	}) => (
		<div>
			<input aria-label="Line Account" {...form.register("details.0.accountCode")} />
			<input aria-label="Line Customer" {...form.register("details.0.customerId")} />
			<input aria-label="Line Memo" {...form.register("details.0.memo")} />
			<input aria-label="Line Amount" type="number" step="0.01" {...form.register("details.0.amount", { valueAsNumber: true })} />
		</div>
	),
}));

describe("CreateExpensePage", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mutateAsyncMock.mockResolvedValue({ id: "cash-1" });
		vi.stubGlobal("crypto", {
			randomUUID: () => "line-1",
		});
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("navigates to the expense preview with printable state when Save & Print succeeds", async () => {
		const user = userEvent.setup();
		render(<CreateExpensePage />);

		await user.clear(screen.getByLabelText("Ref No"));
		await user.type(screen.getByLabelText("Ref No"), "EXP-0001");
		await user.clear(screen.getByLabelText("Date"));
		await user.type(screen.getByLabelText("Date"), "2025-04-22T10:30");
		await user.clear(screen.getByLabelText("Currency"));
		await user.type(screen.getByLabelText("Currency"), "currency-1");
		await user.clear(screen.getByLabelText("Employee"));
		await user.type(screen.getByLabelText("Employee"), "employee-1");
		await user.type(screen.getByLabelText("Memo"), "Fuel purchase");
		await user.clear(screen.getByLabelText("Line Account"));
		await user.type(screen.getByLabelText("Line Account"), "acc-1");
		await user.clear(screen.getByLabelText("Line Customer"));
		await user.type(screen.getByLabelText("Line Customer"), "customer-1");
		await user.type(screen.getByLabelText("Line Memo"), "Truck fuel");
		await user.clear(screen.getByLabelText("Line Amount"));
		await user.type(screen.getByLabelText("Line Amount"), "25");

		await user.click(screen.getByRole("button", { name: "Save & Print" }));

		await waitFor(() => {
			expect(mutateAsyncMock).toHaveBeenCalledTimes(1);
		});

		expect(mutateAsyncMock).toHaveBeenCalledWith({
			refNo: "EXP-0001",
			type: "credit",
			date: "2025-04-22T10:30:00",
			currencyId: "currency-1",
			employeeId: "employee-1",
			memo: "Fuel purchase",
			cashTransactionDetails: [
				{
					chartOfAccountId: "acc-1",
					accountTypeId: "type-1",
					memo: "Truck fuel",
					amount: 25,
					customerId: "customer-1",
					journalClassId: undefined,
				},
			],
		});

		await waitFor(() => {
			expect(navigateMock).toHaveBeenCalledWith("/dashboard/accounting/expense-preview?paper=a5&orientation=landscape", {
				state: expect.objectContaining({
					returnPath: "/dashboard/accounting",
					receiptPaymentAmount: 25,
					receiptPaymentCode: "EXP-0001",
					receiptPaymentDate: "2025-04-22T10:30:00",
					autoPrint: true,
					initialPaperSizeMode: "a5",
					initialOrientationMode: "landscape",
					previewRows: [
						expect.objectContaining({
							refNo: "EXP-0001",
							customerName: "Admin User",
							date: "2025-04-22T10:30:00",
							productName: "Fuel",
							memo: "Truck fuel",
							amount: 25,
							total: 25,
							paid: 25,
							balance: 0,
						}),
					],
				}),
			});
		});
	});
});
