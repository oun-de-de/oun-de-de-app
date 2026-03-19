import { toast } from "sonner";

type NavigateHandler = (to: string) => void;

type SaveDraftOptions = {
	navigate?: NavigateHandler;
	redirectTo?: string;
	successMessage: string;
};

export function saveAccountingDraft({ navigate, redirectTo, successMessage }: SaveDraftOptions) {
	toast.success(successMessage);
	if (navigate && redirectTo) {
		navigate(redirectTo);
	}
}
