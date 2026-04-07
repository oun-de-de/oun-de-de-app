import { act, renderHook, waitFor } from "@testing-library/react";
import type { Loan } from "@/core/types/loan";
import { useBorrowDetailDialogs } from "./use-borrow-detail-dialogs";

const currentDueFixture = {
	dueDate: "2025-04-10T00:00:00",
	amount: 150,
};

const loanFixture: Loan = {
	id: "loan-1",
	borrowerId: "customer-1",
	borrowerName: "Alice",
	borrowerType: "customer",
	principalAmount: 1000,
	paidAmount: 300,
	installmentAmount: 150,
	dueDate: "2025-04-10T00:00:00",
	dueWarningDays: 5,
	startDate: "2025-03-01T00:00:00",
	status: "normal",
	createdAt: "2025-03-01T00:00:00",
};

describe("useBorrowDetailDialogs", () => {
	it("opens payment dialog with current due amount and generated code", async () => {
		const regeneratePaymentCode = vi.fn().mockResolvedValue({
			data: { code: "PAY-001" },
		});

		const { result } = renderHook(() =>
			useBorrowDetailDialogs({
				currentDue: currentDueFixture,
				loan: loanFixture,
				createPayment: vi.fn(),
				extendLoan: vi.fn(),
				updateLoan: vi.fn(),
				postponeLoan: vi.fn(),
				regeneratePaymentCode,
			}),
		);

		act(() => {
			result.current.openPaymentDialog();
		});

		await waitFor(() => {
			expect(result.current.isPaymentDialogOpen).toBe(true);
			expect(result.current.paymentAmount).toBe("150");
			expect(result.current.shouldUpdateDueDate).toBe(true);
			expect(result.current.paymentCode).toBe("PAY-001");
		});
	});

	it("does not create payment when payment data is invalid", async () => {
		const createPayment = vi.fn().mockResolvedValue(undefined);
		const { result } = renderHook(() =>
			useBorrowDetailDialogs({
				currentDue: currentDueFixture,
				loan: loanFixture,
				createPayment,
				extendLoan: vi.fn(),
				updateLoan: vi.fn(),
				postponeLoan: vi.fn(),
				regeneratePaymentCode: vi.fn().mockResolvedValue({ data: { code: "PAY-001" } }),
			}),
		);

		act(() => {
			result.current.setPaymentAmount("0");
			result.current.setPaymentCodeValue("");
		});

		await act(async () => {
			await result.current.handleCreatePayment();
		});

		expect(createPayment).not.toHaveBeenCalled();
	});

	it("creates payment and resets dialog state on success", async () => {
		const createPayment = vi.fn().mockResolvedValue(undefined);
		const { result } = renderHook(() =>
			useBorrowDetailDialogs({
				currentDue: currentDueFixture,
				loan: loanFixture,
				createPayment,
				extendLoan: vi.fn(),
				updateLoan: vi.fn(),
				postponeLoan: vi.fn(),
				regeneratePaymentCode: vi.fn().mockResolvedValue({ data: { code: "PAY-001" } }),
			}),
		);

		act(() => {
			result.current.setIsPaymentDialogOpen(true);
			result.current.setShouldUpdateDueDate(false);
			result.current.setPaymentAmount("200");
			result.current.setPaymentCodeValue(" PAY-123 ");
		});

		await act(async () => {
			await result.current.handleCreatePayment();
		});

		expect(createPayment).toHaveBeenCalledWith({
			code: "PAY-123",
			amount: 200,
			shouldUpdateDueDate: false,
		});
		expect(result.current.isPaymentDialogOpen).toBe(false);
		expect(result.current.paymentCode).toBe("");
		expect(result.current.paymentAmount).toBe("150");
		expect(result.current.shouldUpdateDueDate).toBe(true);
	});

	it("keeps payment dialog state when payment creation fails", async () => {
		const createPayment = vi.fn().mockRejectedValue(new Error("create failed"));
		const { result } = renderHook(() =>
			useBorrowDetailDialogs({
				currentDue: currentDueFixture,
				loan: loanFixture,
				createPayment,
				extendLoan: vi.fn(),
				updateLoan: vi.fn(),
				postponeLoan: vi.fn(),
				regeneratePaymentCode: vi.fn().mockResolvedValue({ data: { code: "PAY-001" } }),
			}),
		);

		act(() => {
			result.current.setIsPaymentDialogOpen(true);
			result.current.setShouldUpdateDueDate(false);
			result.current.setPaymentAmount("200");
			result.current.setPaymentCodeValue(" PAY-123 ");
		});

		await act(async () => {
			await result.current.handleCreatePayment();
		});

		expect(createPayment).toHaveBeenCalledWith({
			code: "PAY-123",
			amount: 200,
			shouldUpdateDueDate: false,
		});
		expect(result.current.isPaymentDialogOpen).toBe(true);
		expect(result.current.paymentCode).toBe(" PAY-123 ");
		expect(result.current.paymentAmount).toBe("200");
		expect(result.current.shouldUpdateDueDate).toBe(false);
	});

	it("does not overwrite payment code when the user edits it before generation completes", async () => {
		let resolveCode: ((value: { data?: { code?: string | null } }) => void) | undefined;
		const regeneratePaymentCode = vi.fn().mockImplementation(
			() =>
				new Promise((resolve) => {
					resolveCode = resolve;
				}),
		);

		const { result } = renderHook(() =>
			useBorrowDetailDialogs({
				currentDue: currentDueFixture,
				loan: loanFixture,
				createPayment: vi.fn(),
				extendLoan: vi.fn(),
				updateLoan: vi.fn(),
				postponeLoan: vi.fn(),
				regeneratePaymentCode,
			}),
		);

		let request: Promise<void>;
		act(() => {
			request = result.current.applyGeneratedPaymentCode(false);
		});

		act(() => {
			result.current.setPaymentCodeValue("MANUAL-CODE");
		});

		await act(async () => {
			resolveCode?.({ data: { code: "PAY-LATE" } });
			await request;
		});

		expect(result.current.paymentCode).toBe("MANUAL-CODE");
	});

	it("overwrites payment code when generation is forced", async () => {
		const { result } = renderHook(() =>
			useBorrowDetailDialogs({
				currentDue: currentDueFixture,
				loan: loanFixture,
				createPayment: vi.fn(),
				extendLoan: vi.fn(),
				updateLoan: vi.fn(),
				postponeLoan: vi.fn(),
				regeneratePaymentCode: vi.fn().mockResolvedValue({ data: { code: "PAY-FORCED" } }),
			}),
		);

		act(() => {
			result.current.setPaymentCodeValue("MANUAL-CODE");
		});

		await act(async () => {
			await result.current.applyGeneratedPaymentCode(true);
		});

		expect(result.current.paymentCode).toBe("PAY-FORCED");
	});

	it("ignores empty generated payment codes", async () => {
		const { result } = renderHook(() =>
			useBorrowDetailDialogs({
				currentDue: currentDueFixture,
				loan: loanFixture,
				createPayment: vi.fn(),
				extendLoan: vi.fn(),
				updateLoan: vi.fn(),
				postponeLoan: vi.fn(),
				regeneratePaymentCode: vi.fn().mockResolvedValue({ data: { code: "   " } }),
			}),
		);

		act(() => {
			result.current.setPaymentCodeValue("MANUAL-CODE");
		});

		await act(async () => {
			await result.current.applyGeneratedPaymentCode(true);
		});

		expect(result.current.paymentCode).toBe("MANUAL-CODE");
	});

	it("resets borrow-more dialog after a successful submit", async () => {
		const extendLoan = vi.fn().mockResolvedValue(undefined);
		const { result } = renderHook(() =>
			useBorrowDetailDialogs({
				currentDue: currentDueFixture,
				loan: loanFixture,
				createPayment: vi.fn(),
				extendLoan,
				updateLoan: vi.fn(),
				postponeLoan: vi.fn(),
				regeneratePaymentCode: vi.fn().mockResolvedValue({ data: { code: "PAY-001" } }),
			}),
		);

		act(() => {
			result.current.setIsBorrowMoreDialogOpen(true);
			result.current.setAdditionalAmount("250");
		});

		await act(async () => {
			await result.current.handleBorrowMore();
		});

		expect(extendLoan).toHaveBeenCalledWith(250);
		expect(result.current.isBorrowMoreDialogOpen).toBe(false);
		expect(result.current.additionalAmount).toBe("");
	});

	it("does not update loan terms when due warning days is out of range", async () => {
		const updateLoan = vi.fn().mockResolvedValue(undefined);
		const { result } = renderHook(() =>
			useBorrowDetailDialogs({
				currentDue: currentDueFixture,
				loan: loanFixture,
				createPayment: vi.fn(),
				extendLoan: vi.fn(),
				updateLoan,
				postponeLoan: vi.fn(),
				regeneratePaymentCode: vi.fn().mockResolvedValue({ data: { code: "PAY-001" } }),
			}),
		);

		act(() => {
			result.current.setIsEditTermsDialogOpen(true);
			result.current.setInstallmentAmountInput("150");
			result.current.setDueWarningDaysInput("30");
		});

		await act(async () => {
			await result.current.handleUpdateLoanTerms();
		});

		expect(updateLoan).not.toHaveBeenCalled();
		expect(result.current.isEditTermsDialogOpen).toBe(true);
	});

	it("does not open edit terms dialog for completed loans", () => {
		const { result } = renderHook(() =>
			useBorrowDetailDialogs({
				currentDue: currentDueFixture,
				loan: {
					...loanFixture,
					status: "complete",
				},
				createPayment: vi.fn(),
				extendLoan: vi.fn(),
				updateLoan: vi.fn(),
				postponeLoan: vi.fn(),
				regeneratePaymentCode: vi.fn().mockResolvedValue({ data: { code: "PAY-001" } }),
			}),
		);

		act(() => {
			result.current.openEditTermsDialog();
		});

		expect(result.current.isEditTermsDialogOpen).toBe(false);
		expect(result.current.installmentAmountInput).toBe("");
		expect(result.current.dueWarningDaysInput).toBe("");
	});
});
