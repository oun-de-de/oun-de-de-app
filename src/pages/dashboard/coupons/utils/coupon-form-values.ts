function parseLocalDateInputValue(value: string): string {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return "";
	const pad = (n: number) => n.toString().padStart(2, "0");
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function toCouponDateInputValue(value: string | null | undefined): string {
	if (!value) return "";

	const directDateMatch = value.match(/^(\d{4}-\d{2}-\d{2})(?:$|T)/);
	return directDateMatch?.[1] ?? parseLocalDateInputValue(value);
}

export function toNumberOrUndefined(value: unknown): number | undefined {
	if (value === "" || value === null || value === undefined) return undefined;
	const parsed = Number(value);
	return Number.isNaN(parsed) ? undefined : parsed;
}
