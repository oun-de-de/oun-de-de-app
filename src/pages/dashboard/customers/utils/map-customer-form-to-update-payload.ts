import type { UpdateCustomer } from "@/core/types/customer";
import type { CustomerFormData } from "../create/components/customer-form";

export type UpdateCustomerInfoInput = Partial<UpdateCustomer>;

const STRING_FIELDS = [
	"registerDate",
	"name",
	"defaultPrice",
	"warehouseId",
	"memo",
	"profileUrl",
	"shopBannerUrl",
	"employeeId",
	"telephone",
	"email",
	"geography",
	"address",
	"location",
	"map",
	"billingAddress",
	"deliveryAddress",
] as const;

export const mapCustomerFormToUpdatePayload = (
	data: CustomerFormData | Partial<UpdateCustomer>,
): UpdateCustomerInfoInput => {
	const payload: UpdateCustomerInfoInput = {};

	for (const key of STRING_FIELDS) {
		const value = data[key];
		if (typeof value === "string") payload[key] = value;
	}

	if (data.status !== undefined) payload.status = Boolean(data.status);

	if (typeof data.referredById === "string" && data.referredById !== "" && data.referredById !== "none") {
		payload.referredById = data.referredById;
	}

	const durationRaw = "paymentTerm" in data ? data.paymentTerm : undefined;
	const startDateRaw = "startDate" in data && typeof data.startDate === "string" ? data.startDate.trim() : "";
	const duration = Number(durationRaw);

	if (
		durationRaw !== undefined &&
		durationRaw !== null &&
		durationRaw !== "" &&
		Number.isFinite(duration) &&
		duration >= 0 &&
		startDateRaw
	) {
		const startDate = new Date(`${startDateRaw}T00:00:00.000Z`);
		if (!Number.isNaN(startDate.getTime())) {
			payload.paymentTerm = {
				duration,
				startDate: startDate.toISOString(),
			};
		}
	}

	return payload;
};
