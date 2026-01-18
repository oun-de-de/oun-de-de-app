import { vendorList, vendorSummaryCards } from "@/_mock/data/dashboard";
import { SmartDataTable, SummaryStatCard } from "@/core/components/common";
import Icon from "@/core/components/icon/icon";
import type { VendorTransactionRow } from "@/core/types/common";
import { Button } from "@/core/ui/button";
import { Text } from "@/core/ui/typography";
import { columns } from "./vendor-columns";

type VendorContentProps = {
	activeVendorId: string | null;
	listState: any; // Ideally import store state type
	updateState: (state: any) => void;
	pagedTransactions: VendorTransactionRow[];
	totalItems: number;
	totalPages: number;
	currentPage: number;
	paginationItems: Array<number | "...">;
};

const summaryCards = vendorSummaryCards;

const filterTypeOptions = [
	{ value: "all", label: "All" },
	{ value: "purchase-order", label: "Purchase Order" },
	{ value: "bill", label: "Bill" },
	{ value: "payment", label: "Payment" },
];

const filterFieldOptions = [
	{ value: "field-name", label: "Field name" },
	{ value: "vendor", label: "Vendor" },
	{ value: "ref-no", label: "Ref No" },
];

export function VendorContent({
	activeVendorId,
	listState,
	updateState,
	pagedTransactions,
	totalItems,
	totalPages,
	currentPage,
	paginationItems,
}: VendorContentProps) {
	const activeVendor = vendorList.find((vendor) => vendor.id === activeVendorId);

	return (
		<>
			<div className="flex flex-wrap items-center justify-between gap-2">
				<div className="flex items-center gap-2">
					<Button size="sm" className="gap-1">
						<Icon icon="mdi:truck-delivery-outline" />
						Vendor
					</Button>
					<Text variant="body2" className="text-muted-foreground">
						{activeVendor ? `${activeVendor.name} selected` : "No Vendor Selected"}
					</Text>
				</div>
				<Button size="sm" className="gap-2">
					<Icon icon="mdi:plus" />
					Create Bill
					<Icon icon="mdi:chevron-down" />
				</Button>
			</div>

			<div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
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
					onTypeChange: (value: string) => updateState({ typeFilter: value, page: 1 }),
					onFieldChange: (value: string) => updateState({ fieldFilter: value, page: 1 }),
					onSearchChange: (value: string) => updateState({ searchValue: value, page: 1 }),
				}}
				paginationConfig={{
					page: currentPage,
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
