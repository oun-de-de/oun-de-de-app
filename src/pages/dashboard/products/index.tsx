import { useEffect, useMemo, useState } from "react";

import { productRows as transactions } from "@/_mock/data/dashboard";
import { DashboardSplitView } from "@/core/components/common/dashboard-split-view";
import { useProductsList, useProductsListActions } from "@/core/store/productsListStore";
import { buildPagination, normalizeToken } from "@/core/utils/dashboard-utils";

import { ProductContent } from "./components/product-content";
import { ProductSidebar } from "./components/product-sidebar";

export default function ProductsPage() {
	const [activeProductId, setActiveProductId] = useState<string | null>(null);
	const listState = useProductsList();
	const { updateState } = useProductsListActions();

	const filteredTransactions = useMemo(() => {
		const normalizedType = normalizeToken(listState.typeFilter);
		const normalizedQuery = listState.searchValue.trim().toLowerCase();

		return transactions.filter((row) => {
			if (normalizedType && normalizedType !== "all") {
				const rowType = normalizeToken(row.type);
				if (rowType !== normalizedType) {
					return false;
				}
			}

			if (!normalizedQuery) {
				return true;
			}

			// Note: productRows currently lacks 'name' field, so we mainly filter by refNo or type
			if (listState.fieldFilter === "ref-no") {
				return row.refNo.toLowerCase().includes(normalizedQuery);
			}

			return (
				row.refNo.toLowerCase().includes(normalizedQuery) || row.type.toLowerCase().includes(normalizedQuery)
				// Add name check here if mock data is updated
			);
		});
	}, [listState.fieldFilter, listState.searchValue, listState.typeFilter]);

	const totalItems = filteredTransactions.length;
	const totalPages = Math.max(1, Math.ceil(totalItems / listState.pageSize));
	const currentPage = Math.min(listState.page, totalPages);

	const pagedTransactions = useMemo(() => {
		const startIndex = (currentPage - 1) * listState.pageSize;
		return filteredTransactions.slice(startIndex, startIndex + listState.pageSize);
	}, [currentPage, filteredTransactions, listState.pageSize]);

	const paginationItems = buildPagination(currentPage, totalPages);

	useEffect(() => {
		if (listState.page > totalPages) {
			updateState({ page: totalPages });
		}
	}, [listState.page, totalPages, updateState]);

	return (
		<DashboardSplitView
			sidebar={<ProductSidebar activeProductId={activeProductId} onSelect={setActiveProductId} />}
			content={
				<ProductContent
					activeProductId={activeProductId}
					listState={listState}
					updateState={updateState}
					pagedTransactions={pagedTransactions}
					totalItems={totalItems}
					totalPages={totalPages}
					currentPage={currentPage}
					paginationItems={paginationItems}
				/>
			}
			className="lg:grid-cols-[320px_1fr]"
		/>
	);
}
