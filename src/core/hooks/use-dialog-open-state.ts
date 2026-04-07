import { useCallback, useState } from "react";

type UseDialogOpenStateParams = {
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	isDismissDisabled?: boolean;
	onClose?: () => void;
};

export function useDialogOpenState({
	open: controlledOpen,
	onOpenChange,
	isDismissDisabled = false,
	onClose,
}: UseDialogOpenStateParams) {
	const [internalOpen, setInternalOpen] = useState(false);
	const isControlled = onOpenChange !== undefined;
	const open = isControlled ? (controlledOpen ?? false) : internalOpen;

	const setOpen = useCallback(
		(nextOpen: boolean, options?: { force?: boolean }) => {
			if (!nextOpen && isDismissDisabled && !options?.force) {
				return;
			}

			if (!nextOpen) {
				onClose?.();
			}

			if (isControlled) {
				onOpenChange?.(nextOpen);
				return;
			}

			setInternalOpen(nextOpen);
		},
		[isControlled, isDismissDisabled, onClose, onOpenChange],
	);

	return {
		open,
		onOpenChange: setOpen,
		close: () => setOpen(false, { force: true }),
	};
}
