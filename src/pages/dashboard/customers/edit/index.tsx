import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import customerService from "@/core/api/services/customer-service";
import employeeService from "@/core/api/services/employee-service";
import type { CreateCustomer } from "@/core/types/customer";
import { Text } from "@/core/ui/typography";
import { CustomerForm, type CustomerFormData } from "../create/components/customer-form";

export default function CustomerEditPage() {
	const navigate = useNavigate();
	const { id } = useParams<{ id: string }>();
	const queryClient = useQueryClient();

	const { data: customer, isLoading } = useQuery({
		queryKey: ["customer", id],
		queryFn: () => customerService.getCustomerById(id || ""),
		enabled: !!id,
	});

	const { data: employees } = useQuery({
		queryKey: ["employees"],
		queryFn: () => employeeService.getEmployeeList({ page: 0, size: 100 }),
	});

	const { data: customers } = useQuery({
		queryKey: ["customers-list"],
		queryFn: () => customerService.getCustomerList({ page: 1, limit: 100 }),
	});

	const employeeOptions = (employees || []).map((emp) => ({
		label: emp.firstName && emp.lastName ? `${emp.firstName} ${emp.lastName}` : emp.username,
		value: emp.id,
	}));

	const customerOptions = (customers?.list || []).map((cus) => ({
		label: cus.name,
		value: cus.id, // referredBy uses code or id? usually code or name for reference
	}));

	const { mutateAsync: updateCustomer } = useMutation({
		mutationFn: async (data: CustomerFormData) => {
			if (!id) return;

			// Strip id from vehicles as API expects CreateVehicle (no id)
			const vehicles = Array.isArray(data.vehicles)
				? data.vehicles.map(({ id: _id, ...rest }: any) => rest)
				: data.vehicles;

			const updateData: Partial<CreateCustomer> = {
				...data,
				vehicles,
			};

			return customerService.updateCustomer(id, updateData);
		},
		onSuccess: () => {
			toast.success("Customer updated successfully");
			queryClient.invalidateQueries({ queryKey: ["customers"] });
			queryClient.invalidateQueries({ queryKey: ["customer", id] });
			navigate("/dashboard/customers");
		},
		onError: (error) => {
			toast.error("Failed to update customer");
			console.error(error);
		},
	});

	if (isLoading) {
		return <div className="p-6">Loading...</div>;
	}

	if (!customer) {
		return <div className="p-6">Customer not found</div>;
	}

	const handleSubmit = async (data: CustomerFormData) => {
		await updateCustomer(data);
	};

	return (
		<div className="flex flex-col h-full p-6 gap-6">
			{/* Header */}
			<div className="flex items-center gap-3">
				<Text className="font-semibold text-sky-600">Edit Customer</Text>
			</div>

			{/* Form */}
			<div className="flex-1 overflow-y-auto">
				<div className="w-full">
					<CustomerForm
						onSubmit={handleSubmit}
						onCancel={() => navigate("/dashboard/customers")}
						mode="edit"
						showTitle={false}
						defaultValues={{
							...customer,
							vehicles: customer.vehicles as any,
						}}
						employeeOptions={employeeOptions}
						customerOptions={customerOptions}
					/>
				</div>
			</div>
		</div>
	);
}
