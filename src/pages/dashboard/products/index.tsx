import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import productService from "@/core/api/services/product-service";
import { DashboardSplitView } from "@/core/components/common/dashboard-split-view";
import { useSidebarCollapse } from "@/core/hooks/use-sidebar-collapse";
import type { Product } from "@/core/types/product";
import { buildPagination } from "@/core/utils/dashboard-utils";
import { ProductContent } from "./components/product-content";
import { ProductSidebar } from "./components/product-sidebar";
import { useProductsList, useProductsListActions } from "./stores/product-list-store";

export default function ProductsPage() {
	const [activeProduct, setActiveProduct] = useState<Product | null>(null);
	const listState = useProductsList();
	const { updateState } = useProductsListActions();

	const { isCollapsed, handleToggle } = useSidebarCollapse();

	// clear active product when user starts searching
	useEffect(() => {
		if (listState.searchValue && activeProduct) {
			setActiveProduct(null);
		}
	}, [listState.searchValue, activeProduct]);

	const { data } = useQuery({
		queryKey: [
			"products",
			listState.page,
			listState.pageSize,
			listState.searchValue,
			listState.typeFilter,
			listState.fieldFilter,
			activeProduct?.name,
		],
		queryFn: () => productService.getProductList(),
	});

	const allProducts = data || [];

	const filteredProducts = allProducts.filter((product) => {
		const query = listState.searchValue.toLowerCase();

		let matchesSearch = true;
		if (query) {
			const name = (product.name || "").toLowerCase();
			const refNo = (product.refNo || "").toLowerCase();

			if (listState.fieldFilter === "ref-no") {
				matchesSearch = refNo.includes(query);
			} else if (listState.fieldFilter === "name") {
				matchesSearch = name.includes(query);
			} else {
				matchesSearch = name.includes(query) || refNo.includes(query);
			}
		}

		return matchesSearch;
	});

	const totalItems = filteredProducts.length;
	const totalPages = Math.max(1, Math.ceil(totalItems / listState.pageSize));
	const currentPage = Math.min(listState.page, totalPages);

	useEffect(() => {
		if (listState.page > totalPages && totalPages > 0) {
			updateState({ page: totalPages });
		}
	}, [listState.page, totalPages, updateState]);

	const pagedProducts = filteredProducts.slice(
		(currentPage - 1) * listState.pageSize,
		currentPage * listState.pageSize,
	);

	const paginationItems = buildPagination(currentPage, totalPages);

	return (
		<DashboardSplitView
			sidebarClassName={isCollapsed ? "lg:w-20" : "lg:w-1/4"}
			sidebar={
				<ProductSidebar
					activeProductId={activeProduct?.id || null}
					onSelect={(id) => setActiveProduct(allProducts.find((p) => p.id === id) || null)}
					onToggle={handleToggle}
					isCollapsed={isCollapsed}
					products={allProducts}
				/>
			}
			content={
				<ProductContent
					activeProduct={activeProduct}
					listState={listState}
					updateState={updateState}
					pagedData={pagedProducts}
					totalItems={totalItems}
					totalPages={totalPages}
					currentPage={currentPage}
					paginationItems={paginationItems}
				/>
			}
		/>
	);
}
