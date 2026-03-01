import type { PaymentTerm } from "@/core/types/customer";
import { toUtcIsoStartOfDay } from "@/core/utils/date-utils";

const hasValue = (value: unknown) => value !== undefined && value !== null && value !== "";

export function resolvePaymentTermFromInput(input: { paymentTerm?: unknown; startDate?: unknown }): {
	paymentTerm?: PaymentTerm;
	error?: string;
} {
	const durationRaw = input.paymentTerm;
	const startDateRaw = input.startDate;

	if (!hasValue(durationRaw) && !hasValue(startDateRaw)) return {};
	if (!hasValue(durationRaw)) return { error: "Payment term duration is required" };
	if (!hasValue(startDateRaw)) return { error: "Payment term start date is required" };

	const duration = Number(durationRaw);
	if (!Number.isFinite(duration) || duration < 0) {
		return { error: "Payment term duration must be a non-negative number" };
	}

	const startDate = toUtcIsoStartOfDay(startDateRaw);
	if (!startDate) return { error: "Payment term start date is invalid" };

	return { paymentTerm: { duration, startDate } };
}

export function isPaymentTermChanged(
	formData: { paymentTerm?: unknown; startDate?: unknown },
	original?: { duration?: number; startDate?: string },
): boolean {
	return (
		String(formData.paymentTerm ?? "") !== String(original?.duration ?? "") ||
		String(formData.startDate ?? "") !== (original?.startDate?.split("T")[0] ?? "")
	);
}
