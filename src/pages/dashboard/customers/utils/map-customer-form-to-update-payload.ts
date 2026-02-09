import type { UpdateCustomer } from "@/core/types/customer";
import type { CustomerFormData } from "../create/components/customer-form";

export type UpdateCustomerInfoInput = Partial<UpdateCustomer>;

// helper to pick only string fields
const pickStringField = <K extends keyof UpdateCustomer>(
	key: K,
	value: CustomerFormData[K] | UpdateCustomer[K],
): Partial<UpdateCustomer> =>
	value !== undefined ? ({ [key]: value as UpdateCustomer[K] } as Partial<UpdateCustomer>) : {};

export const mapCustomerFormToUpdatePayload = (
	data: CustomerFormData | Partial<UpdateCustomer>,
): UpdateCustomerInfoInput => {
	const normalizedReferredById = (() => {
		const value = data.referredById as string | undefined;
		if (value === undefined || value === "" || value === "none") return undefined;
		return value;
	})();

	return {
		...pickStringField("registerDate", data.registerDate),
		...pickStringField("name", data.name),
		...(data.status !== undefined && { status: Boolean(data.status) }),
		...(normalizedReferredById !== undefined && { referredById: normalizedReferredById }),
		...pickStringField("defaultPrice", data.defaultPrice),
		...pickStringField("warehouse", data.warehouse),
		...pickStringField("memo", data.memo),
		...pickStringField("profileUrl", data.profileUrl),
		...pickStringField("shopBannerUrl", data.shopBannerUrl),
		...pickStringField("employeeId", data.employeeId),
		...pickStringField("telephone", data.telephone),
		...pickStringField("email", data.email),
		...pickStringField("geography", data.geography),
		...pickStringField("address", data.address),
		...pickStringField("location", data.location),
		...pickStringField("map", data.map),
		...pickStringField("billingAddress", data.billingAddress),
		...pickStringField("deliveryAddress", data.deliveryAddress),
	};
};
