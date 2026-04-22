import { BackButton, SmartDataTable, SummaryStatCard } from "@/core/components/common";
import { Text } from "@/core/ui/typography";
import { buildPagination } from "@/core/utils/dashboard-utils";
import { useCallback, useMemo } from "react";
import { useEquipmentContent } from "../hooks/use-equipment-content";
import { CreateItemDialog } from "./create-item-dialog";

type Props = {
	activeItemId: string | null;
	onClearSelection: () => void;
};

export function EquipmentContent({ activeItemId, onClearSelection }: Props) {
	const { activeItem, summaryCards, createItem, table, filterConfig, handleRowClick } = useEquipmentContent(activeItemId);
	const handleBack = useCallback(() => {
		onClearSelection();
	}, [onClearSelection]);
	const paginationConfig = useMemo(
		() => ({
			page: table.currentPage,
			pageSize: table.pageSize,
			totalItems: table.totalItems,
			totalPages: table.totalPages,
			paginationItems: buildPagination(table.currentPage, table.totalPages),
			onPageChange: table.setPage,
			onPageSizeChange: (nextSize: number) => {
				table.setPageSize(nextSize);
				table.setPage(1);
			},
		}),
		[table],
	);

	return (
		<>
			{/* Header */}
			<div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
				<div className="flex items-center gap-2">
					{activeItemId ? <BackButton appearance="default" onClick={handleBack} /> : null}
					<Text variant="body2" className="text-slate-400">
						{activeItem ? `${activeItem.name} selected` : "All equipment"}
					</Text>
				</div>
				<div className="flex gap-2">
					<CreateItemDialog onSubmit={createItem.submit} isPending={createItem.isPending} />
				</div>
			</div>
			{/* Summary */}
			<div className="grid grid-cols-1 gap-3 md:grid-cols-3">
				{summaryCards.map((card) => (
					<SummaryStatCard key={card.label} {...card} />
				))}
			</div>

			{/* Transaction Table */}
			<SmartDataTable
				className="flex-1 min-h-0"
				maxBodyHeight="100%"
				data={table.pagedRows}
				columns={table.columns}
				onRowClick={handleRowClick}
				filterConfig={filterConfig}
				paginationConfig={paginationConfig}
			/>
		</>
	);
}
