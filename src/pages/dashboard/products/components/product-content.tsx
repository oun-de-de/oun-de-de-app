import { SmartDataTable } from "@/core/components/common";
import { useCallback, useMemo } from "react";
import type { Product } from "@/core/types/product";
import { Button } from "@/core/ui/button";
import { Text } from "@/core/ui/typography";
import { useNavigate } from "react-router";
import { columns } from "./product-columns";

type ProductContentProps = {
	activeProduct: Product | null;
	listState: any;
	updateState: (state: any) => void;
	pagedData: Product[];
	totalItems: number;
	totalPages: number;
	currentPage: number;
	paginationItems: Array<number | "...">;
};

const FILTER_FIELD_OPTIONS = [
	{ value: "all", label: "All" },
	{ value: "name", label: "Field name" },
	{ value: "ref-no", label: "Ref No" },
];

export function ProductContent({
	activeProduct,
	listState,
	updateState,
	pagedData,
	totalItems,
	totalPages,
	paginationItems,
}: ProductContentProps) {
	const navigate = useNavigate();
	const handleCreateProduct = useCallback(() => {
		navigate("/dashboard/products/create");
	}, [navigate]);
	const handleFieldChange = useCallback((value: string) => updateState({ fieldFilter: value, page: 1 }), [updateState]);
	const handleSearchChange = useCallback(
		(value: string) => updateState({ searchValue: value, page: 1 }),
		[updateState],
	);
	const handlePageChange = useCallback((nextPage: number) => updateState({ page: nextPage }), [updateState]);
	const handlePageSizeChange = useCallback(
		(nextSize: number) => updateState({ pageSize: nextSize, page: 1 }),
		[updateState],
	);
	const filterConfig = useMemo(
		() => ({
			showTypeFilter: false,
			fieldOptions: FILTER_FIELD_OPTIONS,
			fieldValue: listState.fieldFilter,
			searchValue: listState.searchValue,
			onFieldChange: handleFieldChange,
			onSearchChange: handleSearchChange,
		}),
		[handleFieldChange, handleSearchChange, listState.fieldFilter, listState.searchValue],
	);
	const paginationConfig = useMemo(
		() => ({
			page: listState.page,
			pageSize: listState.pageSize,
			totalItems,
			totalPages,
			paginationItems,
			onPageChange: handlePageChange,
			onPageSizeChange: handlePageSizeChange,
		}),
		[
			handlePageChange,
			handlePageSizeChange,
			listState.page,
			listState.pageSize,
			paginationItems,
			totalItems,
			totalPages,
		],
	);

	return (
		<>
			<div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
				<div className="flex items-center gap-2">
					<Text variant="body2" className="text-muted-foreground">
						{activeProduct ? `${activeProduct.name} selected` : "No item selected"}
					</Text>
				</div>
				<div className="flex gap-2">
					<Button size="sm" className="gap-2" onClick={handleCreateProduct}>
						Create Product
					</Button>
				</div>
			</div>
			{/* <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
				{summaryCards.map((card) => (
					<SummaryStatCard key={card.label} {...card} />
				))}
			</div> */}

			<SmartDataTable
				className="flex-1 min-h-0"
				maxBodyHeight="100%"
				data={pagedData}
				columns={columns}
				filterConfig={filterConfig}
				paginationConfig={paginationConfig}
			/>
		</>
	);
}
