import { useMemo } from "react";
import type { CustomerDetail } from "@/core/types/customer";
import { normalizeVehicleType, type Vehicle } from "@/core/types/vehicle";
import type { CustomerFormData } from "../../create/components/customer-form";

function normalizeDateInputValue(value?: string | null) {
	if (!value) return "";

	const directDateMatch = value.match(/^(\d{4}-\d{2}-\d{2})(?:$|[T\s])/);
	if (directDateMatch) return directDateMatch[1];

	const parsed = new Date(value);
	if (Number.isNaN(parsed.getTime())) return "";

	const year = parsed.getFullYear();
	const month = String(parsed.getMonth() + 1).padStart(2, "0");
	const day = String(parsed.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

export const useCustomerDefaults = (customer?: CustomerDetail, vehicles?: Vehicle[]) => {
	return useMemo<CustomerFormData | undefined>(() => {
		if (!customer) return undefined;

		return {
			registerDate: normalizeDateInputValue(customer.registerDate),
			code: customer.code,
			name: customer.name,
			status: customer.status,
			defaultPrice: customer.defaultPrice,
			warehouseId: customer.warehouse?.id ?? customer.warehouseId,
			memo: customer.memo,
			profileUrl: customer.profileUrl,
			shopBannerUrl: customer.shopBannerUrl,
			telephone: customer.contact.telephone,
			email: customer.contact.email,
			geography: customer.contact.geography,
			address: customer.contact.address,
			location: customer.contact.location,
			map: customer.contact.map,
			billingAddress: customer.contact.billingAddress,
			deliveryAddress: customer.contact.deliveryAddress,
			paymentTerm: customer.paymentTerm?.duration,
			startDate: normalizeDateInputValue(customer.paymentTerm?.startDate),
			employeeId: customer.employee.id,
			referredById: customer.customerReference?.id,
			vehicles:
				vehicles?.map((v) => ({
					...v,
					vehicleType: normalizeVehicleType(v.vehicleType),
				})) || [],
		};
	}, [customer, vehicles]);
};
