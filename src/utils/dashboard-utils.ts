export const normalizeToken = (value: string): string => value.trim().toLowerCase().replace(/\s+/g, "-");

export const buildPagination = (current: number, total: number): Array<number | "..."> => {
	if (total <= 7) {
		return Array.from({ length: total }, (_, index) => index + 1);
	}

	const pages: Array<number | "..."> = [1];
	const left = Math.max(2, current - 1);
	const right = Math.min(total - 1, current + 1);

	if (left > 2) {
		pages.push("...");
	}

	for (let page = left; page <= right; page += 1) {
		pages.push(page);
	}

	if (right < total - 1) {
		pages.push("...");
	}

	pages.push(total);
	return pages;
};
