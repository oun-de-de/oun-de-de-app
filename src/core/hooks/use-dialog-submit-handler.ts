import { useCallback } from "react";
import { toast } from "sonner";

type UseDialogSubmitHandlerParams = {
	closeDialog: () => void;
};

export function useDialogSubmitHandler({ closeDialog }: UseDialogSubmitHandlerParams) {
	return useCallback(
		async (action: () => Promise<unknown>) => {
			try {
				await action();
				closeDialog();
			} catch (error: unknown) {
				const message = error instanceof Error ? error.message : "Submission failed";
				console.warn("[useDialogSubmitHandler] Submission failed:", error);
				// Keep the dialog open so callers retain their current form state.
				// Use a generic description to avoid leaking internal error details to the UI.
				toast.error(message, { description: "Please try again or contact support if the issue persists." });
			}
		},
		[closeDialog],
	);
}
