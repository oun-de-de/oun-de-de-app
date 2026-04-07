import { act, renderHook } from "@testing-library/react";
import { useDialogOpenState } from "./use-dialog-open-state";

describe("useDialogOpenState", () => {
	it("blocks dismiss through onOpenChange when dismiss is disabled", () => {
		const onClose = vi.fn();
		const { result } = renderHook(() =>
			useDialogOpenState({
				isDismissDisabled: true,
				onClose,
			}),
		);

		act(() => {
			result.current.onOpenChange(true);
		});
		expect(result.current.open).toBe(true);

		act(() => {
			result.current.onOpenChange(false);
		});

		expect(result.current.open).toBe(true);
		expect(onClose).not.toHaveBeenCalled();
	});

	it("allows programmatic close even when dismiss is disabled", () => {
		const onClose = vi.fn();
		const { result } = renderHook(() =>
			useDialogOpenState({
				isDismissDisabled: true,
				onClose,
			}),
		);

		act(() => {
			result.current.onOpenChange(true);
		});
		expect(result.current.open).toBe(true);

		act(() => {
			result.current.close();
		});

		expect(result.current.open).toBe(false);
		expect(onClose).toHaveBeenCalledTimes(1);
	});
});
