import { useMemo } from "react";
import type { CustomerDetail } from "@/core/types/customer";
import type { Vehicle } from "@/core/types/vehicle";
import type { CustomerFormData } from "../../create/components/customer-form";

export const useCustomerDefaults = (customer?: CustomerDetail, vehicles?: Vehicle[]) => {
	return useMemo<CustomerFormData | undefined>(() => {
		if (!customer) return undefined;

		return {
			registerDate: customer.registerDate?.split("T")[0] || "",
			code: customer.code,
			name: customer.name,
			status: customer.status,
			defaultPrice: customer.defaultPrice,
			warehouseId: customer.warehouseId,
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
			startDate: customer.paymentTerm?.startDate?.split("T")[0] || "",
			employeeId: customer.employee.id,
			referredById: customer.customerReference?.id,
			vehicles:
				vehicles?.map((v) => ({
					...v,
					vehicleType: v.vehicleType.toLowerCase(),
				})) || [],
		};
	}, [customer, vehicles]);
};
