import { act, renderHook } from "@testing-library/react";
import { useDialogSubmitHandler } from "./use-dialog-submit-handler";

describe("useDialogSubmitHandler", () => {
	it("closes dialog after a successful action", async () => {
		const closeDialog = vi.fn();
		const action = vi.fn().mockResolvedValue(undefined);
		const { result } = renderHook(() => useDialogSubmitHandler({ closeDialog }));

		await act(async () => {
			await result.current(action);
		});

		expect(action).toHaveBeenCalledTimes(1);
		expect(closeDialog).toHaveBeenCalledTimes(1);
	});

	it("keeps dialog open when the action fails", async () => {
		const closeDialog = vi.fn();
		const action = vi.fn().mockRejectedValue(new Error("request failed"));
		const { result } = renderHook(() => useDialogSubmitHandler({ closeDialog }));

		await act(async () => {
			await result.current(action);
		});

		expect(action).toHaveBeenCalledTimes(1);
		expect(closeDialog).not.toHaveBeenCalled();
	});
});
