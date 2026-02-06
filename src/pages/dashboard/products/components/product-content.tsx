import { useNavigate } from "react-router";
import { productSummaryCards } from "@/_mock/data/dashboard";
import { SmartDataTable, SummaryStatCard } from "@/core/components/common";
import Icon from "@/core/components/icon/icon";
import type { Product } from "@/core/types/product";
import { Button } from "@/core/ui/button";
import { Text } from "@/core/ui/typography";
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

const summaryCards = productSummaryCards;

const FILTER_TYPE_OPTIONS = [
	{ value: "all", label: "All" },
	{ value: "cash-sale", label: "Cash Sale" },
	{ value: "invoice", label: "Invoice" },
	{ value: "receipt", label: "Receipt" },
];

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
				<div className="flex gap-2">
					<Button size="sm" className="gap-2" onClick={() => navigate("/dashboard/products/create")}>
						<Icon icon="mdi:plus" />
						Create Product
					</Button>
				</div>
			</div>

			<div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
				{summaryCards.map((card) => (
					<SummaryStatCard key={card.label} {...card} />
				))}
			</div>

			<SmartDataTable
				className="flex-1 min-h-0"
				maxBodyHeight="100%"
				data={pagedData}
				columns={columns}
				filterConfig={{
					typeOptions: FILTER_TYPE_OPTIONS,
					fieldOptions: FILTER_FIELD_OPTIONS,
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
