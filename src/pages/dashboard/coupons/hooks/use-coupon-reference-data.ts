import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import employeeService from "@/core/api/services/employee-service";
import productService from "@/core/api/services/product-service";
import vehicleService from "@/core/api/services/vehicle-service";
import { EMPLOYEE_QUERY_KEYS } from "@/core/query-keys/employee-query-keys";
import { PRODUCT_QUERY_KEYS } from "@/core/query-keys/product-query-keys";
import { VEHICLE_QUERY_KEYS } from "@/core/query-keys/vehicle-query-keys";
import { getEmployeeDisplayName } from "@/pages/dashboard/employees/utils/employee-utils";

export function useCouponReferenceData() {
	const { data: employees = [] } = useQuery({
		queryKey: EMPLOYEE_QUERY_KEYS.list(),
		queryFn: () => employeeService.getEmployeeList(),
	});
	const { data: vehicles = [] } = useQuery({
		queryKey: VEHICLE_QUERY_KEYS.list(),
		queryFn: () => vehicleService.getVehicleList(),
	});
	const { data: products = [] } = useQuery({
		queryKey: PRODUCT_QUERY_KEYS.list(),
		queryFn: () => productService.getProductList(),
	});

	const employeeOptions = useMemo(
		() =>
			employees.map((employee) => ({
				label: getEmployeeDisplayName(employee),
				value: employee.id,
			})),
		[employees],
	);
	const vehicleOptions = useMemo(
		() =>
			vehicles.map((vehicle) => ({
				label: `${vehicle.vehicleType} - ${vehicle.licensePlate}`,
				value: vehicle.id,
			})),
		[vehicles],
	);

	return {
		employees,
		vehicles,
		products,
		employeeOptions,
		vehicleOptions,
	};
}
