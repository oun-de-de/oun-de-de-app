import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import customerService from "@/core/api/services/customer-service";
import { Button } from "@/core/ui/button";
import { customerQueryOptions } from "../hooks/use-get-customer";

type CustomerActionsProps = {
	customerId: string;
	customerName: string;
};

export function CustomerActions({ customerId, customerName }: CustomerActionsProps) {
	const navigate = useNavigate();

	const queryClient = useQueryClient();

	const handleEdit = () => {
		navigate(`/dashboard/customers/edit/${customerId}`);
	};

	const handleViewInvoices = () => {
		const params = new URLSearchParams({
			customerId,
			customerName,
		});
		navigate(`/dashboard/invoice?${params.toString()}`);
	};

	// prefetch customer data
	const handlePrefetch = () => {
		queryClient.prefetchQuery(customerQueryOptions(customerId));
	};

	// soft delete
	const { mutateAsync: deleteCustomer } = useMutation({
		mutationFn: async () => {
			return customerService.updateCustomer(customerId, { status: false });
		},
		onSuccess: () => {
			toast.success("Customer deleted successfully");
			queryClient.invalidateQueries({ queryKey: ["customers"] });
		},
		onError: (error) => {
			toast.error("Failed to delete customer");
			console.error(error);
		},
	});

	const handleDelete = async () => {
		if (confirm("Are you sure you want to delete this customer?")) {
			await deleteCustomer();
		}
	};

	return (
		<div className="flex gap-1">
			<Button variant="info" size="sm" className="h-8 gap-1" onClick={handleViewInvoices} title="View invoices">
				Invoice
			</Button>
			<Button
				variant="warning"
				size="sm"
				onClick={handleEdit}
				onMouseEnter={handlePrefetch}
				onFocus={handlePrefetch}
				title="Edit"
			>
				Edit
			</Button>
			<Button variant="destructive" size="sm" onClick={handleDelete} className="text-white" title="Delete">
				Delete
			</Button>
		</div>
	);
}
