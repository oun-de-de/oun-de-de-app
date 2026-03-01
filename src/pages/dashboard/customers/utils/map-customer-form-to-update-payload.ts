import type { UpdateCustomer } from "@/core/types/customer";
import type { CustomerFormData } from "../create/components/customer-form";
import { resolvePaymentTermFromInput } from "./payment-term";

export type UpdateCustomerInfoInput = Partial<UpdateCustomer>;

export const mapCustomerFormToUpdatePayload = (
	data: CustomerFormData,
	options?: { skipPaymentTerm?: boolean },
): UpdateCustomerInfoInput => {
	const payload: UpdateCustomerInfoInput = {
		name: data.name,
		warehouseId: data.warehouseId,
		memo: data.memo,
		profileUrl: data.profileUrl,
		shopBannerUrl: data.shopBannerUrl,
		employeeId: data.employeeId,
		telephone: data.telephone,
		email: data.email,
		geography: data.geography,
		address: data.address,
		location: data.location,
		map: data.map,
		billingAddress: data.billingAddress,
		deliveryAddress: data.deliveryAddress,
		status: data.status !== undefined ? Boolean(data.status) : undefined,
	};

	if (data.referredById && data.referredById !== "none") {
		payload.referredById = data.referredById;
	}

	if (!options?.skipPaymentTerm) {
		const { paymentTerm } = resolvePaymentTermFromInput(data);
		if (paymentTerm) payload.paymentTerm = paymentTerm;
	}

	return payload;
};
