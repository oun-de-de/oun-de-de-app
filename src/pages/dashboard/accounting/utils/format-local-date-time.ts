function getLocalDateParts(date: Date) {
	return {
		year: date.getFullYear(),
		month: String(date.getMonth() + 1).padStart(2, "0"),
		day: String(date.getDate()).padStart(2, "0"),
	};
}

function getLocalTimeParts(date: Date) {
	return {
		hours: String(date.getHours()).padStart(2, "0"),
		minutes: String(date.getMinutes()).padStart(2, "0"),
		seconds: String(date.getSeconds()).padStart(2, "0"),
	};
}

export function formatLocalDateTime(date = new Date()) {
	const { day, month, year } = getLocalDateParts(date);
	const { hours, minutes, seconds } = getLocalTimeParts(date);
	return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}

function normalizeInputValue(value: string) {
	const normalized = value.trim();
	return normalized || undefined;
}

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DATE_TIME_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?$/;

function isValidDateOnlyParts(year: number, month: number, day: number) {
	const date = new Date(year, month - 1, day);
	return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

function isValidDateTimeParts(year: number, month: number, day: number, hours: number, minutes: number, seconds: number) {
	const date = new Date(year, month - 1, day, hours, minutes, seconds);
	return (
		date.getFullYear() === year &&
		date.getMonth() === month - 1 &&
		date.getDate() === day &&
		date.getHours() === hours &&
		date.getMinutes() === minutes &&
		date.getSeconds() === seconds
	);
}

export function formatDateToYYYYMMDD(date: Date | null | undefined) {
	if (!date || !(date instanceof Date) || Number.isNaN(date.getTime())) {
		return "";
	}

	const { year, month, day } = getLocalDateParts(date);
	return `${year}-${month}-${day}`;
}

export function formatLocalDateInputValue(date = new Date()) {
	const { year, month, day } = getLocalDateParts(date);
	return `${year}-${month}-${day}`;
}

export function formatDateTimeLocalInputValue(date = new Date()) {
	const { year, month, day } = getLocalDateParts(date);
	const { hours, minutes } = getLocalTimeParts(date);
	return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function formatDateTimeLocalApiValue(date = new Date()) {
	const { year, month, day } = getLocalDateParts(date);
	const { hours, minutes, seconds } = getLocalTimeParts(date);
	return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

export function formatDateTimeLocalApiValueFromInput(value: string) {
	const normalized = normalizeInputValue(value);
	if (!normalized) return undefined;
	if (!DATE_TIME_PATTERN.test(normalized)) return undefined;
	const [datePart, timePart] = normalized.split("T");
	if (!datePart || !timePart) return undefined;
	const [year, month, day] = datePart.split("-").map(Number);
	const [hours, minutes, seconds = "0"] = timePart.split(":");
	if (!isValidDateTimeParts(year, month, day, Number(hours), Number(minutes), Number(seconds))) return undefined;
	return `${datePart}T${timePart.length === 5 ? `${timePart}:00` : timePart}`;
}

export function formatDateStartLocalApiValue(date: Date) {
	const { year, month, day } = getLocalDateParts(date);
	return `${year}-${month}-${day}T00:00:00`;
}

export function formatDateStartLocalApiValueFromInput(value: string) {
	const normalized = normalizeInputValue(value);
	if (!normalized || !DATE_ONLY_PATTERN.test(normalized)) return undefined;
	const [year, month, day] = normalized.split("-").map(Number);
	if (!isValidDateOnlyParts(year, month, day)) return undefined;
	return normalized ? `${normalized}T00:00:00` : undefined;
}

export function getLocalToday() {
	const now = new Date();
	const { year, month, day } = getLocalDateParts(now);
	return `${year}-${month}-${day}`;
}

export function getLocalNowDateTime() {
	const now = new Date();
	const { year, month, day } = getLocalDateParts(now);
	const { hours, minutes } = getLocalTimeParts(now);
	return `${year}-${month}-${day}T${hours}:${minutes}`;
}
