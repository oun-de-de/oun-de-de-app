export type TemplateMode = "standard" | "compact" | "detailed";
export type PaperSizeMode = "a4" | "a5" | "letter";
export type OrientationMode = "portrait" | "landscape";
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

export const ORIENTATION_LABELS: Record<OrientationMode, string> = {
	portrait: "Portrait",
	landscape: "Landscape",
};

export const SORT_LABELS: Record<SortMode, string> = {
	default: "Default",
	"date-desc": "Date (Newest)",
	"date-asc": "Date (Oldest)",
	"customer-asc": "Customer (A-Z)",
	"balance-desc": "Balance (High-Low)",
};

const PAPER_SIZE_WRAPPER_CLASS_NAMES: Record<PaperSizeMode, Record<OrientationMode, string>> = {
	a4: {
		portrait: "print:mx-auto print:w-full print:max-w-full",
		landscape: "print:mx-auto print:w-full print:max-w-full",
	},
	a5: {
		portrait: "print:mx-auto print:w-full print:max-w-full",
		landscape: "print:mx-auto print:w-full print:max-w-full",
	},
	letter: {
		portrait: "print:mx-auto print:w-full print:max-w-full",
		landscape: "print:mx-auto print:w-full print:max-w-full",
	},
};

const PAPER_SIZE_PAGE_VALUES: Record<PaperSizeMode, string> = {
	a4: "A4",
	a5: "A5",
	letter: "Letter",
};

export function getPaperSizeWrapperClassName(paperSizeMode: PaperSizeMode, orientationMode: OrientationMode): string {
	return PAPER_SIZE_WRAPPER_CLASS_NAMES[paperSizeMode][orientationMode];
}

export function getPaperSizePageValue(paperSizeMode: PaperSizeMode): string {
	return PAPER_SIZE_PAGE_VALUES[paperSizeMode];
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

export type TextSizeMode = "small" | "normal" | "large";

export const TEXT_SIZE_LABELS: Record<TextSizeMode, string> = {
	small: "Small",
	normal: "Normal",
	large: "Large",
};

export function getTextSizeClassName(textSizeMode: TextSizeMode = "normal"): string {
	switch (textSizeMode) {
		case "small":
			return "text-xs [&_table]:text-[11px] [&_th]:text-[11px] [&_td]:text-[11px] [&_td]:py-1 [&_th]:py-1.5";
		case "large":
			return "text-base [&_table]:text-sm [&_th]:text-sm [&_td]:text-sm [&_td]:py-2.5 [&_th]:py-3";
		default:
			return "text-sm [&_table]:text-xs [&_th]:text-xs [&_td]:text-xs";
	}
}
