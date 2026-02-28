import type { UpdateCustomer } from "@/core/types/customer";
import { toUtcIsoPreferNowIfToday, toUtcIsoStartOfDay } from "@/core/utils/date-utils";
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

	const registerDateIso = toUtcIsoPreferNowIfToday(data.registerDate);
	if (registerDateIso) {
		payload.registerDate = registerDateIso;
	}

	if (data.status !== undefined) payload.status = Boolean(data.status);

	if (typeof data.referredById === "string" && data.referredById !== "" && data.referredById !== "none") {
		payload.referredById = data.referredById;
	}

	const durationRaw = "paymentTerm" in data ? data.paymentTerm : undefined;
	const startDateRaw = "startDate" in data ? data.startDate : undefined;
	const duration = Number(durationRaw);
	const startDateIso = toUtcIsoStartOfDay(startDateRaw);

	if (
		durationRaw !== undefined &&
		durationRaw !== null &&
		durationRaw !== "" &&
		Number.isFinite(duration) &&
		duration >= 0 &&
		startDateIso
	) {
		payload.paymentTerm = {
			duration,
			startDate: startDateIso,
		};
	}

	return payload;
};
