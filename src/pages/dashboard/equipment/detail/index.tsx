import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import customerService from "@/core/api/services/customer-service";
import { SmartDataTable } from "@/core/components/common";
import Icon from "@/core/components/icon/icon";
import { Button } from "@/core/ui/button";
import { Text } from "@/core/ui/typography";
import { buildPagination } from "@/core/utils/dashboard-utils";
import { useRouter } from "@/routes/hooks/use-router";
import { EquipmentBorrowingsDialog } from "./components/equipment-borrowings-dialog";
import { EquipmentInfoCard } from "./components/equipment-info-card";
import { UpdateStockDialog } from "./components/update-stock-dialog";
import { useEquipmentDetail } from "./hooks/use-equipment-detail";

export default function EquipmentDetailPage() {
	const router = useRouter();
	const { activeItem, isItemLoading, stockUpdate, table } = useEquipmentDetail();
	const [isUpdateStockOpen, setIsUpdateStockOpen] = useState(false);
	const { data: customerPage } = useQuery({
		queryKey: ["equipment-borrow-customers"],
		queryFn: () => customerService.getCustomerList({ limit: 1000 }),
	});
	const customers = customerPage?.list ?? [];
	const isEquipment = activeItem?.type === "EQUIPMENT";
	const handleUpdateStockOpenChange = (open: boolean) => {
		if (!open) {
			stockUpdate.reset();
		}
		setIsUpdateStockOpen(open);
	};

	if (isItemLoading) {
		return (
			<div className="flex h-full items-center justify-center">
				<Text variant="body1">Loading...</Text>
			</div>
		);
	}

	if (!activeItem) {
		return (
			<div className="flex h-full items-center justify-center">
				<div className="text-center">
					<Text variant="body1" className="mb-4 text-lg font-semibold">
						Equipment not found
					</Text>
					<Button onClick={() => router.push("/dashboard/equipment")}>
						<Icon icon="mdi:arrow-left" className="mr-2" />
						Back to Equipment
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="flex h-full flex-col gap-6 p-6">
			{/* Header */}
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div className="flex items-center gap-2">
					<Button size="sm" variant="outline" onClick={() => router.push("/dashboard/equipment")}>
						<Icon icon="mdi:arrow-left" />
					</Button>
					<Button size="sm" className="gap-1">
						{activeItem.name}
					</Button>
					<Text variant="body2" className="text-slate-400">
						{activeItem.code}
					</Text>
				</div>
				<div className="flex gap-2">
					<UpdateStockDialog
						item={activeItem}
						open={isUpdateStockOpen}
						onOpenChange={handleUpdateStockOpenChange}
						quantity={stockUpdate.qty}
						reason={stockUpdate.reason}
						memo={stockUpdate.memo}
						onQuantityChange={stockUpdate.setQty}
						onReasonChange={stockUpdate.setReason}
						onMemoChange={stockUpdate.setMemo}
						onSubmit={() => stockUpdate.submit(() => handleUpdateStockOpenChange(false))}
						isPending={stockUpdate.isPending}
					/>
					{isEquipment && <EquipmentBorrowingsDialog itemId={activeItem.id} customers={customers} />}
				</div>
			</div>

			<div className="flex-1 min-h-0 overflow-auto space-y-6">
				<EquipmentInfoCard item={activeItem} onUpdate={() => {}} />

				<SmartDataTable
					className="flex-1 min-h-0"
					maxBodyHeight="100%"
					data={table.pagedRows}
					columns={table.columns}
					filterConfig={{
						typeOptions: [
							{ value: "all", label: "All Type" },
							{ value: "IN", label: "Stock In" },
							{ value: "OUT", label: "Stock Out" },
						],
						fieldOptions: [
							{ value: "reason", label: "Reason" },
							{ value: "memo", label: "Memo" },
						],
						typeValue: table.typeFilter,
						fieldValue: table.fieldFilter,
						searchValue: table.searchValue,
						onTypeChange: table.setTypeFilter,
						onFieldChange: table.setFieldFilter,
						onSearchChange: table.setSearchValue,
						searchPlaceholder: "Search transaction",
					}}
					paginationConfig={{
						page: table.currentPage,
						pageSize: table.pageSize,
						totalItems: table.totalItems,
						totalPages: table.totalPages,
						paginationItems: buildPagination(table.currentPage, table.totalPages),
						onPageChange: table.setPage,
						onPageSizeChange: table.setPageSize,
					}}
				/>
			</div>
		</div>
	);
}
