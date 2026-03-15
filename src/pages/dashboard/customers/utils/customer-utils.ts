import { customerSummaryCards } from "@/_mock/data/dashboard";
import type { Customer } from "@/core/types/customer";
import { VEHICLE_TYPE_OPTIONS as CORE_VEHICLE_TYPE_OPTIONS } from "@/core/types/vehicle";
import { formatKHR } from "@/core/utils/formatters";

export const FILTER_TYPE_OPTIONS = [{ value: "all", label: "All" }];

export const FILTER_FIELD_OPTIONS = [
	{ value: "name", label: "Name" },
	{ value: "payment_term", label: "Payment Term" },
];

export const PAYMENT_TERM_FILTER_OPTIONS = [
	{ value: "1", label: "1 day" },
	{ value: "3", label: "3 days" },
	{ value: "5", label: "5 days" },
	{ value: "7", label: "7 days" },
	{ value: "15", label: "15 days" },
	{ value: "30", label: "30 days" },
	{ value: "45", label: "45 days" },
];

export const VEHICLE_TYPE_OPTIONS = [...CORE_VEHICLE_TYPE_OPTIONS];

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
			value: formatKHR(customer.depositBalance),
			icon: "mdi:cash-multiple",
			color: "bg-blue-500",
		},
		{
			label: "Credit Limit",
			value: formatKHR(customer.creditLimit),
			icon: "mdi:credit-card-outline",
			color: "bg-emerald-500",
		},
		{
			label: `Invoice (${customer.invoiceCount || 0})`,
			value: formatKHR(customer.invoiceTotal),
			icon: "mdi:file-document-outline",
			color: "bg-orange-500",
		},
		{
			label: `Overdue (${customer.overdueCount || 0})`,
			value: formatKHR(customer.overdueTotal),
			icon: "mdi:alert-circle-outline",
			color: "bg-red-500",
		},
	];
};
