import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import customerService from "@/core/api/services/customer-service";
import { SmartDataTable } from "@/core/components/common";
import Icon from "@/core/components/icon/icon";
import { Button } from "@/core/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/core/ui/tabs";
import { Text } from "@/core/ui/typography";
import { buildPagination } from "@/core/utils/dashboard-utils";
import { useRouter } from "@/routes/hooks/use-router";
import { StockInForm } from "../components/stock-in-form";
import { StockOutBorrowForm } from "../components/stock-out-borrow-form";
import { useInventoryItems } from "../hooks/use-inventory-items";
import { BorrowingsTable } from "./components/borrowings-table";
import { EquipmentInfoCard } from "./components/equipment-info-card";
import { EquipmentQuickActions } from "./components/equipment-quick-actions";
import { EquipmentSettings } from "./components/equipment-settings";
import { useEquipmentDetail } from "./hooks/use-equipment-detail";

export default function EquipmentDetailPage() {
	const router = useRouter();
	const [activeTab, setActiveTab] = useState("overview");
	const { data: items = [] } = useInventoryItems();
	const { data: customerPage } = useQuery({
		queryKey: ["equipment-borrow-customers"],
		queryFn: () => customerService.getCustomerList({ limit: 1000 }),
	});
	const customers = customerPage?.list ?? [];
	const { activeItem, isItemLoading, stockIn, borrow, borrowingsData, table } = useEquipmentDetail();

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
						<Icon icon="mdi:toolbox-outline" />
						{activeItem.name}
					</Button>
					<Text variant="body2" className="text-slate-400">
						{activeItem.code}
					</Text>
				</div>
				<div className="flex gap-2">
					<Button
						size="sm"
						onClick={() => setActiveTab("transactions")}
						className="gap-1 bg-emerald-600 text-white shadow-sm hover:bg-emerald-700"
					>
						<Icon icon="mdi:swap-horizontal" />
						Update Stock
					</Button>
					<EquipmentQuickActions
						onPrintReport={() => {}}
						onExport={() => {}}
						onDuplicate={() => {}}
						onArchive={() => {}}
					/>
				</div>
			</div>

			{/* Tabbed Content */}
			<Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 min-h-0 flex flex-col">
				<TabsList>
					<TabsTrigger value="overview" className="data-[state=active]:font-bold">
						<Icon icon="mdi:view-dashboard" className="data-[state=active]:text-blue-600" />
						Overview
					</TabsTrigger>
					<TabsTrigger value="transactions" className="data-[state=active]:font-bold">
						<Icon icon="mdi:swap-horizontal" className="data-[state=active]:text-blue-600" />
						Transactions
					</TabsTrigger>
					<TabsTrigger value="borrowings" className="data-[state=active]:font-bold">
						<Icon icon="mdi:hand-extended-outline" className="data-[state=active]:text-blue-600" />
						Borrowings
					</TabsTrigger>
					<TabsTrigger value="settings" className="data-[state=active]:font-bold">
						<Icon icon="mdi:cog" className="data-[state=active]:text-blue-600" />
						Settings
					</TabsTrigger>
				</TabsList>

				{/* Overview Tab */}
				<TabsContent value="overview" className="flex-1 min-h-0 overflow-auto">
					<div className="space-y-6">
						<EquipmentInfoCard item={activeItem} onUpdate={() => {}} />

						{/* Recent Transactions Preview */}
						<div className="rounded-lg border bg-white p-6 shadow-sm">
							<div className="flex items-center justify-between mb-4">
								<Text variant="body1" className="font-semibold">
									Recent Transactions
								</Text>
								<Button size="sm" variant="outline">
									View All
								</Button>
							</div>
							<SmartDataTable
								className="flex-1"
								maxBodyHeight="300px"
								data={table.pagedRows.slice(0, 5)}
								columns={table.columns}
							/>
						</div>
					</div>
				</TabsContent>

				{/* Transactions Tab */}
				<TabsContent value="transactions" className="flex-1 min-h-0 flex flex-col gap-6">
					{/* Stock In/Out Forms */}
					<div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
						<StockInForm
							items={items}
							itemId={activeItem.id}
							quantity={stockIn.qty}
							note={stockIn.note}
							reason={stockIn.reason}
							onItemChange={() => {}}
							onQuantityChange={stockIn.setQty}
							onNoteChange={stockIn.setNote}
							onReasonChange={stockIn.setReason}
							onSubmit={stockIn.submit}
							hideItemSelector
							isPending={stockIn.isPending}
						/>
						<StockOutBorrowForm
							items={items}
							customers={customers}
							itemId={activeItem.id}
							quantity={borrow.qty}
							customerId={borrow.customerId}
							expectedReturnDate={borrow.expectedReturnDate}
							memo={borrow.memo}
							onItemChange={() => {}}
							onQuantityChange={borrow.setQty}
							onCustomerIdChange={borrow.setCustomerId}
							onExpectedReturnDateChange={borrow.setExpectedReturnDate}
							onMemoChange={borrow.setMemo}
							onSubmit={borrow.submit}
							hideItemSelector
							isPending={borrow.isPending}
						/>
					</div>

					{/* Transaction Table */}
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
				</TabsContent>

				{/* Borrowings Tab */}
				<TabsContent value="borrowings" className="flex-1 min-h-0 overflow-auto">
					<BorrowingsTable
						borrowings={borrowingsData.list}
						onReturn={borrowingsData.returnItem}
						onPay={(customerId) => router.push(`/dashboard/borrow?customerId=${customerId}`)}
						isReturnPending={borrowingsData.isReturnPending}
					/>
				</TabsContent>

				{/* Settings Tab */}
				<TabsContent value="settings" className="flex-1 min-h-0 overflow-auto">
					<EquipmentSettings item={activeItem} onUpdate={() => {}} />
				</TabsContent>
			</Tabs>
		</div>
	);
}
