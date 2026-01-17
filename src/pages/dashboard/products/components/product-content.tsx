import Icon from "@/components/icon/icon";
import { Button } from "@/core/ui/button";
import { Text } from "@/core/ui/typography";
import { SmartDataTable, SummaryStatCard } from "@/components/common";
import type { ColumnDef } from "@tanstack/react-table";
import { productList, productSummaryCards } from "@/_mock/data/dashboard";
import type { ProductRow } from "@/core/types/common";

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

const columns: ColumnDef<ProductRow>[] = [
	{
		header: "Date",
		accessorKey: "date",
		meta: { className: "text-gray-600" },
	},
	{
		header: "Ref No",
		accessorKey: "refNo",
		meta: { className: "text-sky-600" },
	},
	{
		header: "Type",
		cell: ({ row }) => (
			<span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs text-sky-700">{row.original.type}</span>
		),
	},
	{
		header: "Status",
		cell: ({ row }) => (
			<span className="rounded-md bg-amber-100 px-2 py-0.5 text-xs text-amber-700">{row.original.status}</span>
		),
	},
	{
		header: "Qty",
		accessorKey: "qty",
		meta: { className: "text-right" },
	},
	{
		header: "Cost",
		cell: ({ row }) => row.original.cost.toLocaleString(),
		meta: { className: "text-right" },
	},
	{
		header: "Price",
		cell: ({ row }) => <span className="font-semibold">{row.original.price.toLocaleString()}</span>,
		meta: { className: "text-right" },
	},
];

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
