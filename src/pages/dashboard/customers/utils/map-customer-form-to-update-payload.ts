import type { UpdateCustomer } from "@/core/types/customer";
import { toUtcIsoStartOfDay } from "@/core/utils/date-utils";

export type UpdateCustomerInfoInput = Partial<UpdateCustomer>;

const STRING_FIELDS = [
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
	data: any, // Use any to handle both CustomerFormData and CustomerDetail
): UpdateCustomerInfoInput => {
	const payload: UpdateCustomerInfoInput = {};

	for (const key of STRING_FIELDS) {
		const value = data[key];
		if (typeof value === "string") {
			payload[key] = value;
		}
	}

	// Handle nested contact fields if it's a CustomerDetail object
	if (data.contact) {
		for (const key of STRING_FIELDS) {
			if (key in data.contact && typeof data.contact[key] === "string") {
				payload[key] = data.contact[key];
			}
		}
	}

	// Handle nested employee field if it's a CustomerDetail object
	if (data.employee?.id) {
		payload.employeeId = data.employee.id;
	}

	// Handle status
	if (data.status !== undefined) {
		payload.status = Boolean(data.status);
	}

	// Handle referredById
	const referredById = data.referredById || data.customerReference?.id;
	if (typeof referredById === "string" && referredById !== "" && referredById !== "none") {
		payload.referredById = referredById;
	}

	const durationRaw = data.paymentTerm?.duration ?? ("paymentTerm" in data ? data.paymentTerm : undefined);
	const startDateRaw = data.paymentTerm?.startDate ?? ("startDate" in data ? data.startDate : undefined);

	const duration = typeof durationRaw === "object" ? durationRaw?.duration : Number(durationRaw);
	const startDateIso = toUtcIsoStartOfDay(typeof startDateRaw === "object" ? startDateRaw?.startDate : startDateRaw);

	if (
		duration !== undefined &&
		duration !== null &&
		duration !== "" &&
		Number.isFinite(Number(duration)) &&
		Number(duration) >= 0 &&
		startDateIso
	) {
		payload.paymentTerm = {
			duration: Number(duration),
			startDate: startDateIso,
		};
	}

	return payload;
};
