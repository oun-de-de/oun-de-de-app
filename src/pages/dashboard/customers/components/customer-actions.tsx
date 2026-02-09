import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import customerService from "@/core/api/services/customer-service";
import Icon from "@/core/components/icon/icon";
import { Button } from "@/core/ui/button";
import { customerQueryOptions } from "../hooks/use-get-customer";

type CustomerActionsProps = {
	customerId: string;
};

export function CustomerActions({ customerId }: CustomerActionsProps) {
	const navigate = useNavigate();

	const queryClient = useQueryClient();

	const handleEdit = () => {
		navigate(`/dashboard/customers/edit/${customerId}`);
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
			<Button
				variant="ghost"
				size="icon"
				className="h-8 w-8 text-muted-foreground hover:text-primary"
				onClick={handleEdit}
				onMouseEnter={handlePrefetch}
				onFocus={handlePrefetch}
				title="Edit"
			>
				<Icon icon="mdi:pencil" />
			</Button>
			<Button
				variant="ghost"
				size="icon"
				className="h-8 w-8 text-muted-foreground hover:text-destructive"
				onClick={handleDelete}
				title="Delete"
			>
				<Icon icon="mdi:delete" />
			</Button>
		</div>
	);
}
