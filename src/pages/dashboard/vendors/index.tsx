import { useEffect, useMemo, useState } from "react";
import { vendorTransactions } from "@/_mock/data/dashboard";
import { DashboardSplitView } from "@/core/components/common/dashboard-split-view";
import { useVendorsList, useVendorsListActions } from "@/core/store/vendorsListStore";
import { buildPagination, normalizeToken } from "@/core/utils/dashboard-utils";
import { VendorContent } from "./components/vendor-content";
import { VendorSidebar } from "./components/vendor-sidebar";

const transactions = vendorTransactions;

export default function VendorsPage() {
	const [activeVendorId, setActiveVendorId] = useState<string | null>(null);
	const listState = useVendorsList();
	const { updateState } = useVendorsListActions();

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

			if (listState.fieldFilter === "vendor") {
				return row.vendor.toLowerCase().includes(normalizedQuery);
			}

			if (listState.fieldFilter === "ref-no") {
				return row.refNo.toLowerCase().includes(normalizedQuery);
			}

			return (
				row.vendor.toLowerCase().includes(normalizedQuery) ||
				row.refNo.toLowerCase().includes(normalizedQuery) ||
				row.type.toLowerCase().includes(normalizedQuery)
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
			sidebar={<VendorSidebar activeVendorId={activeVendorId} onSelect={setActiveVendorId} />}
			content={
				<VendorContent
					activeVendorId={activeVendorId}
					listState={listState}
					updateState={updateState}
					pagedTransactions={pagedTransactions}
					totalItems={totalItems}
					totalPages={totalPages}
					currentPage={currentPage}
					paginationItems={paginationItems}
				/>
			}
		/>
	);
}
