import { getPaginationItems } from "./pagination";

export const normalizeToken = (value: string): string => value.trim().toLowerCase().replace(/\s+/g, "-");

export const buildPagination = (current: number, total: number): Array<number | "..."> => {
	return getPaginationItems(current, total);
};
