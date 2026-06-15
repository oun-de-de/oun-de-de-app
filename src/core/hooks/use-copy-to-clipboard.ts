import { useState } from "react";
import { toast } from "sonner";
import { debugLogger } from "@/core/utils/logger";

type CopiedValue = string | null;
type CopyFn = (text: string) => Promise<boolean>;
type ReturnType = {
	copyFn: CopyFn;
	copiedText: CopiedValue;
};

export const useCopyToClipboard = (): ReturnType => {
	const [copiedText, setCopiedText] = useState<CopiedValue>(null);

	const copyFn: CopyFn = async (text) => {
		if (!navigator?.clipboard) {
			debugLogger.warn("Clipboard not supported");
			return false;
		}

		// Try to save to clipboard then save it in the state if worked
		try {
			await navigator.clipboard.writeText(text);
			setCopiedText(text);
			toast.success("Copied!");
			return true;
		} catch (error) {
			debugLogger.warn("Copy failed", error);
			setCopiedText(null);
			return false;
		}
	};

	return { copiedText, copyFn };
};
