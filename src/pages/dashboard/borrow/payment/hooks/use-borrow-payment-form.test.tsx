import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";

import customerService from "@/core/api/services/customer-service";
import employeeService from "@/core/api/services/employee-service";
import loanService from "@/core/api/services/loan-service";
import { useBorrowPaymentForm } from "./use-borrow-payment-form";

const navigateMock = vi.fn();
const clearCartMock = vi.fn();
const createLoanMock = vi.fn();

let cartState: Array<{ name: string; code: string; qty: number }> = [];

vi.mock("react-router", () => ({
	useNavigate: () => navigateMock,
}));

vi.mock("sonner", () => ({
	toast: {
		success: vi.fn(),
		error: vi.fn(),
	},
}));

vi.mock("@/core/api/services/customer-service", () => ({
	default: {
		getCustomerList: vi.fn(),
	},
}));

vi.mock("@/core/api/services/employee-service", () => ({
	default: {
		getEmployeeList: vi.fn(),
	},
}));

vi.mock("@/core/api/services/loan-service", () => ({
	default: {
		generateLoanCode: vi.fn(),
		createLoan: vi.fn(),
	},
}));

vi.mock("@/pages/dashboard/borrow/stores/borrow-cart-store", () => ({
	useBorrowCartSelector: (selector: (state: { cart: Array<{ name: string; code: string; qty: number }> }) => unknown) =>
		selector({ cart: cartState }),
	useBorrowCartActions: () => ({
		clearCart: clearCartMock,
	}),
}));

function createWrapper() {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				retry: false,
				gcTime: Infinity,
				staleTime: Infinity,
			},
		},
	});

	return function Wrapper({ children }: { children: ReactNode }) {
		return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
	};
}

describe("useBorrowPaymentForm", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		cartState = [];
		vi.mocked(loanService.generateLoanCode).mockResolvedValue({ code: "LOAN-001" });
		vi.mocked(loanService.createLoan).mockImplementation(createLoanMock);
		vi.mocked(customerService.getCustomerList).mockResolvedValue({
			list: [],
			page: 1,
			pageSize: 1000,
			pageCount: 0,
			total: 0,
		});
		vi.mocked(employeeService.getEmployeeList).mockResolvedValue([]);
		createLoanMock.mockReset();
	});

	it("does not prefill memo from the borrow cart summary when that behavior is disabled", async () => {
		cartState = [
			{ name: "Dryer", code: "EQ-001", qty: 1 },
			{ name: "Ice Box", code: "EQ-002", qty: 2 },
		];

		const { result } = renderHook(() => useBorrowPaymentForm(), {
			wrapper: createWrapper(),
		});

		await waitFor(() => {
			expect(result.current.form.getValues("loanCode")).toBe("LOAN-001");
		});

		expect(result.current.form.getValues("memo")).toBe("");
	});

	it("submits only the manual memo without merging cart items", async () => {
		cartState = [{ name: "Dryer", code: "EQ-001", qty: 1 }];
		createLoanMock.mockResolvedValue({ id: "loan-1" });

		const { result } = renderHook(() => useBorrowPaymentForm(), {
			wrapper: createWrapper(),
		});

		await waitFor(() => {
			expect(result.current.form.getValues("loanCode")).toBe("LOAN-001");
		});

		await act(async () => {
			result.current.confirm({
				borrowerType: "customer",
				borrowerId: "customer-1",
				employeeId: "",
				loanCode: " LOAN-001 ",
				depositAmount: 1000,
				monthlyAmount: 100,
				dueWarningDays: 7,
				dueDate: new Date("2025-05-01T00:00:00.000Z"),
				memo: "Customer buying dryer",
			});
		});

		expect(createLoanMock).toHaveBeenCalledWith(
			expect.objectContaining({
				code: "LOAN-001",
				borrowerType: "customer",
				borrowerId: "customer-1",
				principalAmount: 1000,
				loanInstallmentAmount: 100,
				dueWarningDays: 7,
				startDate: "2025-05-01T00:00:00",
				memo: "Customer buying dryer",
			}),
		);

		await waitFor(() => {
			expect(clearCartMock).toHaveBeenCalledTimes(1);
			expect(navigateMock).toHaveBeenCalledWith("/dashboard/loan", { replace: true });
		});
	});
});
