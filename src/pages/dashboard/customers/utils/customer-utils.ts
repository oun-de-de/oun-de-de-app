import { customerSummaryCards } from "@/_mock/data/dashboard";
import type { Customer } from "@/core/types/customer";

export const FILTER_TYPE_OPTIONS = [{ value: "all", label: "All" }];

export const FILTER_FIELD_OPTIONS = [
	{ value: "all", label: "All Fields" },
	{ value: "name", label: "Name" },
];

export const VEHICLE_TYPE_OPTIONS = [
	{ value: "truck", label: "Truck" },
	{ value: "tuk_tuk", label: "Tuk Tuk" },
	{ value: "others", label: "Others" },
];

export const DEFAULT_PRICE_OPTIONS = [
	{ value: "retail_price", label: "Retail Price" },
	{ value: "wholesale_price", label: "Wholesale Price" },
	{ value: "special_price", label: "Special Price" },
];

export const getSummaryStats = (customer: Customer | null) => {
	if (!customer) return customerSummaryCards;

	return [
		{
			label: "Deposit Balance",
			value: customer.depositBalance ?? 0,
			icon: "mdi:cash-multiple",
			color: "bg-blue-500",
		},
		{
			label: "Credit Limit",
			value: customer.creditLimit || 0,
			icon: "mdi:credit-card-outline",
			color: "bg-emerald-500",
		},
		{
			label: `Invoice (${customer.invoiceCount || 0})`,
			value: customer.invoiceTotal || 0,
			icon: "mdi:file-document-outline",
			color: "bg-orange-500",
		},
		{
			label: `Overdue (${customer.overdueCount || 0})`,
			value: customer.overdueTotal || 0,
			icon: "mdi:alert-circle-outline",
			color: "bg-red-500",
		},
	];
};
