import type { ColumnDef } from "@tanstack/react-table";
import type { Customer } from "@/core/types/customer";
import { Badge } from "@/core/ui/badge";
import { formatDisplayDate } from "@/core/utils/formatters";
import { getStatusVariant } from "@/core/utils/get-status-variant";
import { CustomerActions } from "./customer-actions";

const getCustomerPaymentType = (customer: Customer) => (customer.paymentTerm ? "credit" : "cash_sale");

const formatPaymentTypeLabel = (value: string) =>
	value
		.split("_")
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
		.join(" ");

export const columns: ColumnDef<Customer>[] = [
	{
		header: "Register Date",
		size: 100,
		accessorKey: "registerDate",
		cell: ({ row }) => formatDisplayDate(row.original.registerDate),
		meta: { bodyClassName: "text-center" },
	},
	{
		header: "Code",
		accessorKey: "code",
		size: 120,
		cell: ({ row }) => <span className="font-mono">{row.original.code}</span>,
	},
	{
		header: "Name",
		accessorKey: "name",
	},
	{
		header: "Phone",
		size: 100,
		accessorKey: "telephone",
	},
	{
		header: "Payment Type",
		size: 120,
		id: "paymentType",
		meta: { bodyClassName: "text-center" },
		cell: ({ row }) => {
			const paymentType = getCustomerPaymentType(row.original);
			return (
				<Badge variant={paymentType === "credit" ? "success" : "info"} className="w-3/4 h-6.5">
					{formatPaymentTypeLabel(paymentType)}
				</Badge>
			);
		},
	},
	{
		header: "Customer Type",
		accessorKey: "referredBy",
	},
	{
		header: "Status",
		accessorKey: "status",
		size: 80,
		meta: { bodyClassName: "text-center" },
		cell: ({ row }) => {
			const status = row.original.status ? "Active" : "Inactive";
			const variant = getStatusVariant(status);
			return (
				<Badge variant={variant} className="w-full h-6.5">
					{status}
				</Badge>
			);
		},
	},
	{
		header: "",
		id: "actions",
		size: 40,
		cell: ({ row }) => <CustomerActions customerId={row.original.id} customerName={row.original.name} />,
		meta: { bodyClassName: "text-center" },
	},
];
