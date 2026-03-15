import { CYCLE_STATUS_OPTIONS } from "@/core/types/cycle";

export const INVOICE_FILTER_FIELD_OPTIONS = [
	{ value: "refNo", label: "Invoice No" },
	{ value: "customerName", label: "Customer" },
];

export const DURATION_OPTIONS = [
	{ value: "0", label: "All Duration" },
	{ value: "1", label: "1 Day" },
	{ value: "3", label: "3 Days" },
	{ value: "5", label: "5 Days" },
	{ value: "7", label: "7 Days" },
	{ value: "10", label: "10 Days" },
	{ value: "15", label: "15 Days" },
	{ value: "20", label: "20 Days" },
	{ value: "30", label: "30 Days" },
	{ value: "45", label: "45 Days" },
] as const;

export { CYCLE_STATUS_OPTIONS };
