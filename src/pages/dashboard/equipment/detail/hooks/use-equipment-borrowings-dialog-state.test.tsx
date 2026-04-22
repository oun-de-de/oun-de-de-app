import { act, renderHook } from "@testing-library/react";
import { toast } from "sonner";
import { useEquipmentBorrowingsDialogState } from "./use-equipment-borrowings-dialog-state";

const sellMutate = vi.fn();
const returnMutate = vi.fn();

vi.mock("sonner", () => ({
	toast: {
		error: vi.fn(),
		success: vi.fn(),
		warning: vi.fn(),
	},
}));

vi.mock("../../hooks/use-inventory-mutations", () => ({
	useSellBorrowing: () => ({
		mutate: sellMutate,
		isPending: false,
	}),
	useReturnBorrowing: () => ({
		mutate: returnMutate,
		isPending: false,
	}),
}));

describe("useEquipmentBorrowingsDialogState", () => {
	beforeEach(() => {
		vi.useRealTimers();
		sellMutate.mockReset();
		returnMutate.mockReset();
		vi.mocked(toast.error).mockReset();
	});

	it("resets history dialog state when all dialogs are reset", () => {
		const { result } = renderHook(() => useEquipmentBorrowingsDialogState("item-1"));

		act(() => {
			result.current.setHistoryDialogPage(3);
			result.current.openHistoryDialog();
			result.current.openSellAction("borrowing-1", "Alice");
			result.current.setSellRefCode("SELL-001");
			result.current.setSellExpense("10");
		});

		act(() => {
			result.current.resetAllDialogs();
		});

		expect(result.current.isHistoryDialogOpen).toBe(false);
		expect(result.current.historyPage).toBe(1);
		expect(result.current.pendingAction).toBeNull();
		expect(result.current.sellRefCode).toBe("");
		expect(result.current.sellExpense).toBe("");
	});

	it("shows an error instead of selling when ref code is missing", () => {
		const { result } = renderHook(() => useEquipmentBorrowingsDialogState("item-1"));

		act(() => {
			result.current.openSellAction("borrowing-1", "Alice");
			result.current.setSellRefCodeMode("manual");
			result.current.setSellRefCode("");
		});

		act(() => {
			result.current.confirmPendingAction();
		});

		expect(toast.error).toHaveBeenCalledWith("Reference code is required");
		expect(sellMutate).not.toHaveBeenCalled();
	});

	it("auto-generates the next SAL ref code when sell action opens", async () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-04-23T10:15:30"));

		const { result } = renderHook(() => useEquipmentBorrowingsDialogState("item-1"));

		await act(async () => {
			result.current.openSellAction("borrowing-1", "Alice");
		});

		expect(result.current.sellRefCode).toBe("SAL-20260423-101530");
	});

	it("regenerates the sell ref code when requested", async () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-04-23T10:15:30"));

		const { result } = renderHook(() => useEquipmentBorrowingsDialogState("item-1"));

		await act(async () => {
			result.current.openSellAction("borrowing-1", "Alice");
		});

		expect(result.current.sellRefCode).toBe("SAL-20260423-101530");

		vi.setSystemTime(new Date("2026-04-23T10:15:31"));

		await act(async () => {
			result.current.regenerateSellRefCode();
		});

		expect(result.current.sellRefCode).toBe("SAL-20260423-101531");
	});

	it("submits sell action and clears pending state on success", () => {
		sellMutate.mockImplementation((_payload, options?: { onSuccess?: () => void }) => {
			options?.onSuccess?.();
		});

		const { result } = renderHook(() => useEquipmentBorrowingsDialogState("item-1"));

		act(() => {
			result.current.openSellAction("borrowing-1", "Alice");
			result.current.setSellRefCodeMode("manual");
			result.current.setSellRefCode(" SELL-001 ");
			result.current.setSellExpense("12");
		});

		act(() => {
			result.current.confirmPendingAction();
		});

		expect(sellMutate).toHaveBeenCalledWith(
			{
				borrowingId: "borrowing-1",
				data: {
					refCode: "SELL-001",
					expense: 12,
				},
			},
			expect.objectContaining({
				onSuccess: expect.any(Function),
			}),
		);
		expect(result.current.pendingAction).toBeNull();
		expect(result.current.sellRefCode).toBe("");
		expect(result.current.sellExpense).toBe("");
	});

	it("shows an error instead of selling when expense is invalid", () => {
		const { result } = renderHook(() => useEquipmentBorrowingsDialogState("item-1"));

		act(() => {
			result.current.openSellAction("borrowing-1", "Alice");
			result.current.setSellRefCode("SELL-001");
			result.current.setSellExpense("-1");
		});

		act(() => {
			result.current.confirmPendingAction();
		});

		expect(toast.error).toHaveBeenCalledWith("Expense must be 0 or greater");
		expect(sellMutate).not.toHaveBeenCalled();
	});

	it("submits return action and clears pending state on success", () => {
		returnMutate.mockImplementation((_borrowingId, options?: { onSuccess?: () => void }) => {
			options?.onSuccess?.();
		});

		const { result } = renderHook(() => useEquipmentBorrowingsDialogState("item-1"));

		act(() => {
			result.current.openReturnAction("borrowing-2", "Bob");
		});

		act(() => {
			result.current.confirmPendingAction();
		});

		expect(returnMutate).toHaveBeenCalledWith(
			"borrowing-2",
			expect.objectContaining({
				onSuccess: expect.any(Function),
			}),
		);
		expect(result.current.pendingAction).toBeNull();
	});
});
