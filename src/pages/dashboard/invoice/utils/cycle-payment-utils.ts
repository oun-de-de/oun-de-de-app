export function normalizeInputValue(value: string): string | undefined {
	const normalized = value.trim();
	return normalized || undefined;
}

export type CyclePaymentFormDefaults = {
	paymentCode: string;
	amount: string;
	paymentDateTime: string;
};

export type CycleLoanFormDefaults = {
	loanStartDate: string;
	monthlyAmount: string;
	dueWarningDays: string;
};

export function toApiLocalDateTime(dateTimeLocal: string): string | undefined {
	const normalized = normalizeInputValue(dateTimeLocal);
	if (!normalized) return undefined;
	const [datePart, timePart] = normalized.split("T");
	if (!datePart || !timePart) return undefined;
	return `${datePart}T${timePart.length === 5 ? `${timePart}:00` : timePart}`;
}

export function toApiLocalDateStart(dateOnly: string): string | undefined {
	const normalized = normalizeInputValue(dateOnly);
	if (!normalized) return undefined;
	return `${normalized}T00:00:00`;
}

export function getLocalDateParts(date = new Date()) {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return { year, month, day };
}

export function getLocalToday(): string {
	const now = new Date();
	const { year, month, day } = getLocalDateParts(now);
	return `${year}-${month}-${day}`;
}

export function getLocalNowDateTime(): string {
	const now = new Date();
	const { year, month, day } = getLocalDateParts(now);
	const hours = String(now.getHours()).padStart(2, "0");
	const minutes = String(now.getMinutes()).padStart(2, "0");
	return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function getPaymentFormDefaults(): CyclePaymentFormDefaults {
	return {
		paymentCode: "",
		amount: "",
		paymentDateTime: getLocalNowDateTime(),
	};
}

export function getLoanFormDefaults(): CycleLoanFormDefaults {
	return {
		loanStartDate: getLocalToday(),
		monthlyAmount: "",
		dueWarningDays: "5",
	};
}

export function digitsOnly(value: string): string {
	return value.replace(/\D/g, "");
}
