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
		portrait: "print:mx-auto print:w-[186mm] print:max-w-[186mm]",
		landscape: "print:mx-auto print:w-[273mm] print:max-w-[273mm]",
	},
	a5: {
		portrait: "print:mx-auto print:w-[118mm] print:max-w-[118mm]",
		landscape: "print:mx-auto print:w-[186mm] print:max-w-[186mm]",
	},
	letter: {
		portrait: "print:mx-auto print:w-[184mm] print:max-w-[184mm]",
		landscape: "print:mx-auto print:w-[246mm] print:max-w-[246mm]",
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
