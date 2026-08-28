import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { useState } from "react";

import cycleService from "@/core/api/services/cycle-service";
import loanService from "@/core/api/services/loan-service";
import type { Cycle } from "@/core/types/cycle";
import { CyclePaymentDialog } from "./cycle-payment-dialog";

const navigateMock = vi.fn();
const createPaymentMock = vi.fn();
const convertToLoanMock = vi.fn();
let isCreatingPayment = false;
let isConvertingToLoan = false;

vi.mock("react-router", () => ({
	useNavigate: () => navigateMock,
}));

vi.mock("@/core/components/common", () => ({
	SmartDataTable: () => <div data-testid="payment-history-table" />,
}));

vi.mock("../hooks/use-cycle-payments", () => ({
	useCyclePayments: () => ({
		payments: [],
		isLoadingPayments: false,
		createPayment: createPaymentMock,
		isCreatingPayment,
		convertToLoan: convertToLoanMock,
		isConvertingToLoan,
	}),
}));

vi.mock("../../accounting/components/form-date-time-local-picker", () => ({
	FormDateTimeLocalPicker: ({
		control,
		name,
		disabled,
	}: {
		control: { register: (fieldName: string) => Record<string, unknown> };
		name: string;
		disabled?: boolean;
	}) => <input aria-label="Payment Date Time" disabled={disabled} {...control.register(name)} />,
}));

vi.mock("@/core/api/services/cycle-service", () => ({
	default: {
		generatePaymentCode: vi.fn(),
	},
}));

vi.mock("@/core/api/services/loan-service", () => ({
	default: {
		generateLoanCode: vi.fn(),
	},
}));

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

function renderDialog(props?: {
	createPaymentImpl?: typeof createPaymentMock;
	convertToLoanImpl?: typeof convertToLoanMock;
	isPending?: boolean;
	isConverting?: boolean;
	onOpenChangeSpy?: (open: boolean) => void;
}) {
	const wrapper = createWrapper();
	isCreatingPayment = props?.isPending ?? false;
	isConvertingToLoan = props?.isConverting ?? false;
	createPaymentMock.mockImplementation(props?.createPaymentImpl ?? vi.fn().mockResolvedValue(undefined));
	convertToLoanMock.mockImplementation(props?.convertToLoanImpl ?? vi.fn().mockResolvedValue({ id: "loan-1" }));

	function TestHarness() {
		const [open, setOpen] = useState(true);
		const handleOpenChange = (nextOpen: boolean) => {
			props?.onOpenChangeSpy?.(nextOpen);
			setOpen(nextOpen);
		};

		return (
			<>
				<button type="button" onClick={() => setOpen(true)}>
					Reopen
				</button>
				<CyclePaymentDialog open={open} onOpenChange={handleOpenChange} cycle={cycleFixture} />
			</>
		);
	}

	const renderResult = render(<TestHarness />, { wrapper });

	return {
		...renderResult,
		setPending(nextPending: boolean) {
			isCreatingPayment = nextPending;
			renderResult.rerender(<TestHarness />);
		},
	};
}

describe("CyclePaymentDialog", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		isCreatingPayment = false;
		isConvertingToLoan = false;
		vi.mocked(cycleService.generatePaymentCode).mockResolvedValue({ code: "PAY-001" });
		vi.mocked(loanService.generateLoanCode).mockResolvedValue({ code: "LOAN-001" });
	});

	it("closes and resets after a successful payment submit", async () => {
		const user = userEvent.setup();
		vi.mocked(cycleService.generatePaymentCode)
			.mockResolvedValueOnce({ code: "PAY-001" })
			.mockResolvedValueOnce({ code: "PAY-002" });
		renderDialog();

		await waitFor(() => {
			expect(screen.getByLabelText(/Payment Code/i)).toHaveValue("PAY-001");
		});

		await user.type(screen.getByLabelText(/^Amount$/i), "25");
		await user.click(screen.getByRole("button", { name: "Create Payment" }));

		await waitFor(() => {
			expect(createPaymentMock).toHaveBeenCalledTimes(1);
			expect(screen.queryByText("Create Cycle Payment")).not.toBeInTheDocument();
		});

		await user.click(screen.getByRole("button", { name: "Reopen" }));

		await waitFor(() => {
			expect(screen.getByLabelText(/^Amount$/i)).toHaveValue("");
			expect(screen.getByLabelText(/Payment Code/i)).toHaveValue("PAY-002");
		});
	});

	it("keeps the dialog open and preserves values when submit fails", async () => {
		const user = userEvent.setup();
		const onOpenChangeSpy = vi.fn();
		renderDialog({
			createPaymentImpl: vi.fn().mockRejectedValue(new Error("request failed")),
			onOpenChangeSpy,
		});

		await waitFor(() => {
			expect(screen.getByLabelText(/Payment Code/i)).toHaveValue("PAY-001");
		});

		const amountInput = screen.getByLabelText(/^Amount$/i);

		await user.type(amountInput, "30");
		await user.click(screen.getByRole("button", { name: "Create Payment" }));

		await waitFor(() => {
			expect(createPaymentMock).toHaveBeenCalledTimes(1);
			expect(screen.getByText("Create Cycle Payment")).toBeInTheDocument();
		});

		expect(amountInput).toHaveValue("30");
		expect(screen.getByLabelText(/Payment Code/i)).toHaveValue("PAY-001");
		expect(onOpenChangeSpy).not.toHaveBeenCalledWith(false);
	});

	it("does not allow dismissing the dialog from the chrome close button while payment is pending", async () => {
		const user = userEvent.setup();
		const onOpenChangeSpy = vi.fn();
		renderDialog({ isPending: true, onOpenChangeSpy });

		const chromeCloseButton = screen
			.getAllByRole("button", { name: "Close" })
			.find((button) => !button.hasAttribute("disabled"));

		expect(chromeCloseButton).toBeDefined();
		await user.click(chromeCloseButton!);

		expect(screen.getByText("Create Cycle Payment")).toBeInTheDocument();
		expect(onOpenChangeSpy).not.toHaveBeenCalled();
		expect(screen.getByRole("button", { name: "Saving..." })).toBeDisabled();
	});

	it("becomes non-dismissible after submit enters the pending state", async () => {
		const user = userEvent.setup();
		const onOpenChangeSpy = vi.fn();
		const { setPending } = renderDialog({
			onOpenChangeSpy,
			createPaymentImpl: vi.fn(() => new Promise(() => undefined)),
		});

		await waitFor(() => {
			expect(screen.getByLabelText(/Payment Code/i)).toHaveValue("PAY-001");
		});

		await user.type(screen.getByLabelText(/^Amount$/i), "40");
		await user.click(screen.getByRole("button", { name: "Create Payment" }));

		setPending(true);

		const chromeCloseButton = screen
			.getAllByRole("button", { name: "Close" })
			.find((button) => !button.hasAttribute("disabled"));

		expect(screen.getByRole("button", { name: "Saving..." })).toBeDisabled();
		expect(chromeCloseButton).toBeDefined();

		await user.click(chromeCloseButton!);

		expect(onOpenChangeSpy).not.toHaveBeenCalledWith(false);
		expect(screen.getByText("Create Cycle Payment")).toBeInTheDocument();
	});

	it("submits loan conversion with generated loan code and navigates to loan detail", async () => {
		const user = userEvent.setup();
		renderDialog({
			convertToLoanImpl: vi.fn().mockResolvedValue({ id: "loan-99" }),
		});

		await user.click(screen.getByRole("tab", { name: "Convert to Loan" }));

		await waitFor(() => {
			expect(screen.getByLabelText(/Loan Code/i)).toHaveValue("LOAN-001");
		});

		await user.type(screen.getByLabelText(/Monthly Amount/i), "55");
		await user.clear(screen.getByLabelText(/Due Date Warning Days/i));
		await user.type(screen.getByLabelText(/Due Date Warning Days/i), "7");
		await user.type(screen.getByLabelText(/Memo/i), "Cycle converted to loan");
		await user.click(screen.getByRole("button", { name: "Convert To Loan" }));

		await waitFor(() => {
			expect(convertToLoanMock).toHaveBeenCalledTimes(1);
		});

		const payload = convertToLoanMock.mock.calls[0]?.[0];
		expect(payload).toMatchObject({
			code: "LOAN-001",
			loanInstallmentAmount: 55,
			dueWarningDays: 7,
			memo: "Cycle converted to loan",
		});
		expect(payload.startDate).toMatch(/T00:00:00/);

		await waitFor(() => {
			expect(navigateMock).toHaveBeenCalledWith("/dashboard/loan/loan-99");
		});
	});

	it("does not send due warning days when the field is left blank", async () => {
		const user = userEvent.setup();
		renderDialog({
			convertToLoanImpl: vi.fn().mockResolvedValue({ id: "loan-100" }),
		});

		await user.click(screen.getByRole("tab", { name: "Convert to Loan" }));

		await waitFor(() => {
			expect(screen.getByLabelText(/Loan Code/i)).toHaveValue("LOAN-001");
		});

		await user.type(screen.getByLabelText(/Monthly Amount/i), "80");
		await user.clear(screen.getByLabelText(/Due Date Warning Days/i));
		await user.click(screen.getByRole("button", { name: "Convert To Loan" }));

		await waitFor(() => {
			expect(convertToLoanMock).toHaveBeenCalledTimes(1);
		});

		const payload = convertToLoanMock.mock.calls[0]?.[0];
		expect(payload).toMatchObject({
			code: "LOAN-001",
			loanInstallmentAmount: 80,
		});
		expect(payload).not.toHaveProperty("dueWarningDays");
		expect(payload).not.toHaveProperty("memo");
	});
});
