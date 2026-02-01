import isEqual from "fast-deep-equal";
import type { PaginatedResponse } from "@/core/types/common";
import { copyWithPagination, type Pagination } from "../types/pagination";

/**
 * Generates an array of pagination items (page numbers and ellipses) based on the current page and total pages.
 *
 * @param currentPage - The current active page (1-indexed).
 * @param totalPages - The total number of pages.
 * @param siblingCount - (Optional) Number of page buttons to show on each side of the current page. Defaults to 1.
 * @returns An array containing page numbers and "..." strings representing gaps.
 */
export const getPaginationItems = (currentPage: number, totalPages: number, siblingCount = 1): (number | "...")[] => {
	// Total number of items to show in the pagination bar (first + last + current + 2*siblings + 2*dots is a max scenario, but usually simplified)
	// We want to show at least 5 items if no dots are needed: [1, 2, 3, 4, 5]
	const totalPageNumbers = siblingCount + 5;

	// Case 1: If the number of pages is less than the page numbers we want to show in our paginationComponent, we return the range [1..totalPages]
	if (totalPages <= totalPageNumbers) {
		return Array.from({ length: totalPages }, (_, i) => i + 1);
	}

	// Calculate left and right sibling index and make sure they are within range 1 and totalPages
	const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
	const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

	// We do not show dots just when there is just one page number to be inserted between the extremes of sibling and the page limits i.e 1 and totalPages.
	// Hence we are using leftSiblingIndex > 2 and rightSiblingIndex < totalPages - 2
	const shouldShowLeftDots = leftSiblingIndex > 2;
	const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

	const firstPageIndex = 1;
	const lastPageIndex = totalPages;

	// Case 2: No left dots to show, but rights dots to be shown
	if (!shouldShowLeftDots && shouldShowRightDots) {
		const leftItemCount = 3 + 2 * siblingCount;
		const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
		return [...leftRange, "...", totalPages];
	}

	// Case 3: No right dots to show, but left dots to be shown
	if (shouldShowLeftDots && !shouldShowRightDots) {
		const rightItemCount = 3 + 2 * siblingCount;
		const rightRange = Array.from({ length: rightItemCount }, (_, i) => totalPages - rightItemCount + i + 1);
		return [firstPageIndex, "...", ...rightRange];
	}

	// Case 4: Both left and right dots to be shown
	if (shouldShowLeftDots && shouldShowRightDots) {
		const middleRange = Array.from(
			{ length: rightSiblingIndex - leftSiblingIndex + 1 },
			(_, i) => leftSiblingIndex + i,
		);
		return [firstPageIndex, "...", ...middleRange, "...", lastPageIndex];
	}

	return [];
};

export function updatePage<T>(pagination: Pagination<T>, newPagination: Pagination<T>): Pagination<T> {
	const updatedList = [...pagination.list];

	newPagination.list.forEach((item) => {
		const index = updatedList.findIndex((e) => isEqual(e, item));
		if (index >= 0) {
			updatedList[index] = item; // update
		} else {
			updatedList.push(item); // add mới
		}
	});

	return copyWithPagination(pagination, {
		list: updatedList,
		page: newPagination.page,
		pageSize: newPagination.pageSize,
		pageCount: newPagination.pageCount,
		total: newPagination.total,
		error: newPagination.error,
	});
}

export function mapPaginatedResponseToPagination<T>(response: PaginatedResponse<T> | T[]): Pagination<T> {
	if (Array.isArray(response)) {
		return {
			list: response,
			page: 1,
			pageSize: response.length,
			pageCount: 1,
			total: response.length,
		};
	}
	return {
		list: response.content,
		page: response.number + 1,
		pageSize: response.size,
		pageCount: response.totalPages,
		total: response.totalElements,
	};
}
