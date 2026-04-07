import { useCallback } from "react";

type UseDialogSubmitHandlerParams = {
	closeDialog: () => void;
};

export function useDialogSubmitHandler({ closeDialog }: UseDialogSubmitHandlerParams) {
	return useCallback(
		async (action: () => Promise<unknown>) => {
			try {
				await action();
				closeDialog();
			} catch {
				// Keep the dialog open so callers retain their current form state.
			}
		},
		[closeDialog],
	);
}
