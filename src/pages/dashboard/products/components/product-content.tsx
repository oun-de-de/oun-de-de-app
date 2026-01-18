import { productList, productSummaryCards } from "@/_mock/data/dashboard";
import { SmartDataTable, SummaryStatCard } from "@/core/components/common";
import Icon from "@/core/components/icon/icon";
import type { ProductRow } from "@/core/types/common";
import { Button } from "@/core/ui/button";
import { Text } from "@/core/ui/typography";

type ProductContentProps = {
	activeProductId: string | null;
	listState: any; // Ideally import store state type
	updateState: (state: any) => void;
	pagedTransactions: ProductRow[];
	totalItems: number;
	totalPages: number;
	currentPage: number;
	paginationItems: Array<number | "...">;
};

const summaryCards = productSummaryCards;

const filterTypeOptions = [
	{ value: "all", label: "All" },
	{ value: "cash-sale", label: "Cash Sale" },
	{ value: "invoice", label: "Invoice" },
	{ value: "receipt", label: "Receipt" },
];

const filterFieldOptions = [
	{ value: "field-name", label: "Field name" },
	{ value: "ref-no", label: "Ref No" },
];

import { columns } from "./product-columns";

export function ProductContent({
	activeProductId,
	listState,
	updateState,
	pagedTransactions,
	totalItems,
	totalPages,
	paginationItems,
}: ProductContentProps) {
	const activeProduct = productList.find((item) => item.id === activeProductId);

	return (
		<>
			<div className="flex flex-wrap items-center justify-between gap-2">
				<div className="flex items-center gap-2">
					<Button size="sm" className="gap-1">
						<Icon icon="mdi:package-variant" />
						Inventory
					</Button>
					<Text variant="body2" className="text-muted-foreground">
						{activeProduct ? `${activeProduct.name} selected` : "No item selected"}
					</Text>
				</div>
				<Button size="sm" className="gap-2">
					<Icon icon="mdi:plus" />
					Create Sale
					<Icon icon="mdi:chevron-down" />
				</Button>
			</div>

			<div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
				{summaryCards.map((card) => (
					<SummaryStatCard key={card.label} {...card} />
				))}
			</div>

			<SmartDataTable
				data={pagedTransactions}
				columns={columns}
				filterConfig={{
					typeOptions: filterTypeOptions,
					fieldOptions: filterFieldOptions,
					typeValue: listState.typeFilter,
					fieldValue: listState.fieldFilter,
					searchValue: listState.searchValue,
					typePlaceholder: "Cash Sale",
					onTypeChange: (value: string) => updateState({ typeFilter: value, page: 1 }),
					onFieldChange: (value: string) => updateState({ fieldFilter: value, page: 1 }),
					onSearchChange: (value: string) => updateState({ searchValue: value, page: 1 }),
				}}
				paginationConfig={{
					page: listState.page,
					pageSize: listState.pageSize,
					totalItems: totalItems,
					totalPages: totalPages,
					paginationItems: paginationItems,
					onPageChange: (nextPage: number) => updateState({ page: nextPage }),
					onPageSizeChange: (nextSize: number) => updateState({ pageSize: nextSize, page: 1 }),
				}}
			/>
		</>
	);
}
