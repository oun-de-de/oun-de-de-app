export type TemplateMode = "standard" | "compact" | "detailed";
export type PaperSizeMode = "a4" | "a5" | "letter";
export type SortMode = "default" | "date-desc" | "date-asc" | "customer-asc" | "balance-desc";

export const TEMPLATE_LABELS: Record<TemplateMode, string> = {
	standard: "Standard",
	compact: "Compact",
	detailed: "Detailed",
};

export const PAPER_SIZE_LABELS: Record<PaperSizeMode, string> = {
	a4: "A4",
	a5: "A5",
	letter: "Letter",
};

export const SORT_LABELS: Record<SortMode, string> = {
	default: "Default",
	"date-desc": "Date (Newest)",
	"date-asc": "Date (Oldest)",
	"customer-asc": "Customer (A-Z)",
	"balance-desc": "Balance (High-Low)",
};

export function getPaperSizeWrapperClassName(paperSizeMode: PaperSizeMode): string {
	switch (paperSizeMode) {
		case "a5":
			return "print:mx-auto print:max-w-[560px]";
		case "letter":
			return "print:mx-auto print:max-w-[816px]";
		default:
			return "print:mx-auto print:max-w-[794px]";
	}
}

export function getTemplateClassName(templateMode: TemplateMode): string {
	switch (templateMode) {
		case "compact":
			return "rounded-t-none gap-4 p-4 text-[11px]";
		case "detailed":
			return "rounded-t-none gap-8 p-8 text-sm";
		default:
			return "rounded-t-none gap-6 p-6";
	}
}
