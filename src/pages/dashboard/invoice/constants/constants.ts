const INVOICE_TYPE_FILTER_OPTIONS = [
	{ value: "invoice", label: "Invoice" },
	{ value: "receipt", label: "Receipt" },
] as const;

export const INVOICE_FILTER_TYPE_OPTIONS = [{ value: "all", label: "All Type" }, ...INVOICE_TYPE_FILTER_OPTIONS];

export const INVOICE_FILTER_FIELD_OPTIONS = [
	{ value: "all", label: "All Field" },
	{ value: "type", label: "Type" },
];

export const INVOICE_TYPE_OPTIONS = [...INVOICE_TYPE_FILTER_OPTIONS];

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
