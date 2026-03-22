import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/core/ui/dropdown-menu";
import Icon from "@/core/components/icon/icon";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { customerQueryOptions } from "../hooks/use-get-customer";

type CustomerActionsProps = {
	customerId: string;
	customerName: string;
};

export function CustomerActions({ customerId, customerName }: CustomerActionsProps) {
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const editUrl = `/dashboard/customers/edit/${customerId}`;

	const handleEdit = () => navigate(editUrl);

	const handleViewInvoices = () => {
		const params = new URLSearchParams({ customerId, customerName });
		navigate(`/dashboard/invoice?${params.toString()}`);
	};

	const handleScrollTo = (section: string) => {
		navigate(editUrl, { state: { scrollTo: section } });
	};

	// prefetch customer data
	const handlePrefetch = () => {
		queryClient.prefetchQuery(customerQueryOptions(customerId));
	};

	return (
		<div
			className="flex items-center gap-1"
			onClick={(event) => {
				event.stopPropagation();
			}}
		>
			{/* <Button variant="info" size="sm" className="h-7 gap-1 text-xs" onClick={handleViewInvoices} title="View invoices">
				Invoice
			</Button>
			<Button
				variant="warning"
				size="sm"
				className="h-7 text-xs"
				onClick={handleEdit}
				onMouseEnter={handlePrefetch}
				onFocus={handlePrefetch}
				title="Edit"
			>
				Edit
			</Button> */}
			<DropdownMenu>
				<DropdownMenuTrigger
					className="h-6 w-8 justify-center border-gray-200 p-0 hover:bg-gray-50"
					onMouseEnter={handlePrefetch}
					onFocus={handlePrefetch}
				>
					<Icon icon="mdi:menu" className="text-gray-500" />
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="w-44">
					<DropdownMenuItem onClick={handleEdit} className="cursor-pointer">
						Edit Customer
					</DropdownMenuItem>
					<DropdownMenuItem onClick={handleViewInvoices} className="cursor-pointer">
						View Invoices
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => handleScrollTo("product-settings")} className="cursor-pointer">
						Product Settings
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => handleScrollTo("warehouse-settings")} className="cursor-pointer">
						Warehouse Settings
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => handleScrollTo("vehicle-settings")} className="cursor-pointer">
						Vehicle Settings
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
