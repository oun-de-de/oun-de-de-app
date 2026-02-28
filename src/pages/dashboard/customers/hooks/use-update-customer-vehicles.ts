import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import customerService from "@/core/api/services/customer-service";
import type { CreateVehicle } from "@/core/types/vehicle";

type UpdateVehicleInput = {
	id: string;
	vehicleType: CreateVehicle["vehicleType"];
	licensePlate: string;
};

export const useUpdateCustomerVehicles = (customerId?: string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (vehicles: UpdateVehicleInput[]) => {
			if (!customerId) throw new Error("Customer ID is required");
			if (vehicles.length === 0) return [];

			return Promise.all(
				vehicles.map((vehicle) =>
					customerService.updateCustomerVehicle(customerId, vehicle.id, {
						vehicleType: vehicle.vehicleType,
						licensePlate: vehicle.licensePlate,
					}),
				),
			);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["customer-vehicles", customerId] });
			queryClient.invalidateQueries({ queryKey: ["customer", customerId] });
		},
		onError: () => {
			toast.error("Failed to update vehicles");
		},
	});
};
