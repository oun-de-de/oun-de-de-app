import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useForm } from "react-hook-form";
import type { ReactNode } from "react";

import cycleService from "@/core/api/services/cycle-service";
import type { Cycle } from "@/core/types/cycle";
import { useCyclePaymentDialogState } from "./use-cycle-payment-dialog-state";

vi.mock("@/core/api/services/cycle-service", () => ({
	default: {
		generatePaymentCode: vi.fn(),
	},
}));

type PaymentFormValues = {
	paymentCode: string;
	amount: string;
	paymentDateTime: string;
};

type LoanFormValues = {
	loanCode: string;
	loanStartDate: string;
	monthlyAmount: string;
	dueWarningDays: string;
};

const cycleFixture: Cycle = {
	id: "cycle-1",
	customerId: "customer-1",
	customerName: "Alice",
	startDate: "2025-01-01",
	endDate: "2025-01-31",
	status: "OPEN",
	totalAmount: 100,
	totalPaidAmount: 10,
};

const paymentDefaults = () => ({
	paymentCode: "",
	amount: "",
	paymentDateTime: "2025-01-01T08:00",
});

const loanDefaults = () => ({
	loanCode: "",
	loanStartDate: "2025-01-01",
	monthlyAmount: "",
	dueWarningDays: "5",
});

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

function renderCycleDialogState(options?: { open?: boolean; historyOnly?: boolean; defaultTab?: "payment" | "loan" }) {
	const wrapper = createWrapper();

	return renderHook(
		({
			open = true,
			historyOnly = false,
			defaultTab = "payment",
		}: {
			open?: boolean;
			historyOnly?: boolean;
			defaultTab?: "payment" | "loan";
		}) => {
			const paymentForm = useForm<PaymentFormValues>({
				defaultValues: {
					paymentCode: "",
					amount: "",
					paymentDateTime: "2025-01-01T08:00",
				},
			});
			const loanForm = useForm<LoanFormValues>({
				defaultValues: {
					loanCode: "",
					loanStartDate: "2025-01-01",
					monthlyAmount: "",
					dueWarningDays: "5",
				},
			});

			const state = useCyclePaymentDialogState({
				open,
				cycle: cycleFixture,
				defaultTab,
				historyOnly,
				payments: [],
				isLoadingPayments: false,
				paymentForm,
				loanForm,
				createPaymentFormDefaults: paymentDefaults,
				createLoanFormDefaults: loanDefaults,
			});

			return {
				...state,
				paymentForm,
				loanForm,
			};
		},
		{
			initialProps: options,
			wrapper,
		},
	);
}

describe("useCyclePaymentDialogState", () => {
	beforeEach(() => {
		vi.mocked(cycleService.generatePaymentCode).mockReset();
	});

	it("resets page, tab, and forms when the dialog opens", async () => {
		vi.mocked(cycleService.generatePaymentCode).mockResolvedValue({ code: "PAY-001" });
		const { result, rerender } = renderCycleDialogState({ open: false, defaultTab: "loan" });

		act(() => {
			result.current.setPage(3);
			result.current.setActiveTab("payment");
			result.current.paymentForm.setValue("amount", "99");
			result.current.loanForm.setValue("monthlyAmount", "55");
		});

		rerender({ open: true, defaultTab: "loan", historyOnly: false });

		await waitFor(() => {
			expect(result.current.page).toBe(1);
			expect(result.current.activeTab).toBe("loan");
			expect(result.current.paymentForm.getValues("amount")).toBe("");
			expect(result.current.loanForm.getValues("monthlyAmount")).toBe("");
		});
	});

	it("applies generated payment code to the payment form", async () => {
		vi.mocked(cycleService.generatePaymentCode).mockResolvedValue({ code: "PAY-123" });
		const { result } = renderCycleDialogState({ open: true });

		await act(async () => {
			await result.current.applyGeneratedPaymentCode(true);
		});

		await waitFor(() => {
			expect(result.current.paymentForm.getValues("paymentCode")).toBe("PAY-123");
		});
	});

	it("does not overwrite payment code when the user edits it before generation completes", async () => {
		let resolveCode: ((value: { code: string }) => void) | undefined;
		vi.mocked(cycleService.generatePaymentCode).mockImplementation(
			() =>
				new Promise((resolve) => {
					resolveCode = resolve;
				}),
		);
		const { result } = renderCycleDialogState({ open: true });

		const request = act(async () => {
			await result.current.applyGeneratedPaymentCode(false);
		});

		act(() => {
			result.current.paymentForm.setValue("paymentCode", "MANUAL-CODE");
		});

		await act(async () => {
			resolveCode?.({ code: "PAY-LATE" });
			await request;
		});

		expect(result.current.paymentForm.getValues("paymentCode")).toBe("MANUAL-CODE");
	});
});
