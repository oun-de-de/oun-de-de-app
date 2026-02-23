import type { OnChangeFn, SortingState } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { SmartDataTable, SummaryStatCard } from "@/core/components/common";
import Icon from "@/core/components/icon/icon";
import type { SummaryStatCardData } from "@/core/types/common";
import type { Cycle } from "@/core/types/cycle";
import type { Invoice, InvoiceExportPreviewRow } from "@/core/types/invoice";
import { Button } from "@/core/ui/button";
import { Text } from "@/core/ui/typography";
import {
	INVOICE_FILTER_FIELD_OPTIONS,
	INVOICE_FILTER_TYPE_OPTIONS,
	INVOICE_TYPE_OPTIONS,
} from "../constants/constants";
import { useInvoiceSelection } from "../hooks/use-invoice-selection";
import { CyclePaymentDialog } from "./cycle-payment-dialog";
import { InvoiceBulkUpdateDialog } from "./invoice-bulk-update-dialog";
import { getInvoiceColumns } from "./invoice-columns";

type InvoiceContentProps = {
	pagedData: Invoice[];
	summaryCards: SummaryStatCardData[];
	activeInvoiceLabel?: string | null;
	typeFilter: string;
	fieldFilter: string;
	searchValue: string;
	currentPage: number;
	pageSize: number;
	totalItems: number;
	totalPages: number;
	paginationItems: Array<number | "...">;
	onTypeFilterChange: (value: string) => void;
	onFieldFilterChange: (value: string) => void;
	onSearchChange: (value: string) => void;
	onPageChange: (value: number) => void;
	onPageSizeChange: (value: number) => void;
	sorting: SortingState;
	onSortingChange: OnChangeFn<SortingState>;
	isLoading?: boolean;
	onBack?: () => void;
	activeCycle?: Cycle | null;
};

export function InvoiceContent({
	pagedData,
	summaryCards,
	activeInvoiceLabel,
	typeFilter,
	fieldFilter,
	searchValue,
	currentPage,
	pageSize,
	totalItems,
	totalPages,
	paginationItems,
	onTypeFilterChange,
	onFieldFilterChange,
	onSearchChange,
	onPageChange,
	onPageSizeChange,
	sorting,
	onSortingChange,
	isLoading,
	onBack,
	activeCycle = null,
}: InvoiceContentProps) {
	const navigate = useNavigate();
	const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
	const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
	const {
		selectedInvoiceIds,
		selectedInvoiceById,
		selectedIdSet,
		allSelected,
		partiallySelected,
		onToggleAll,
		onToggleOne,
		rowById,
	} = useInvoiceSelection(pagedData);

	const columns = useMemo(
		() =>
			getInvoiceColumns({
				allSelected,
				partiallySelected,
				selectedIds: selectedIdSet,
				onToggleAll,
				onToggleOne,
			}),
		[allSelected, partiallySelected, selectedIdSet, onToggleAll, onToggleOne],
	);

	const handleOpenExportPreview = () => {
		if (selectedInvoiceIds.length === 0) return;

		const previewRows: InvoiceExportPreviewRow[] = selectedInvoiceIds.map((id) => {
			const row = selectedInvoiceById[id] ?? rowById.get(id);
			return {
				refNo: row?.refNo ?? id,
				customerName: row?.customerName ?? "-",
				date: row?.date ?? "",
				productName: null,
				unit: null,
				pricePerProduct: null,
				quantityPerProduct: null,
				quantity: null,
				amount: null,
				total: null,
				memo: null,
				paid: null,
				balance: null,
			};
		});

		navigate("/dashboard/invoice/export-preview", {
			state: {
				selectedInvoiceIds,
				previewRows,
			},
		});
	};

	return (
		<div className={`flex w-full flex-col gap-4 ${isLoading ? "opacity-60 pointer-events-none" : ""}`}>
			<div className="flex flex-wrap items-center justify-between gap-2">
				<div className="flex items-center gap-2">
					{onBack && (
						<Button size="sm" variant="ghost" onClick={onBack} className="gap-1">
							<Icon icon="mdi:arrow-left" />
							Back
						</Button>
					)}
					<Button size="sm" className="gap-1">
						<Icon icon="mdi:file-document-outline" />
						Invoice
					</Button>
					<Text variant="body2" className="text-muted-foreground">
						{activeInvoiceLabel ? `${activeInvoiceLabel} selected` : "Manage customer invoices"}
					</Text>
				</div>
				<div className="flex items-center gap-2">
					{selectedInvoiceIds.length > 0 && (
						<Text variant="body2" className="text-muted-foreground">
							Selected: {selectedInvoiceIds.length}
						</Text>
					)}
					<Button
						size="sm"
						disabled={selectedInvoiceIds.length === 0}
						onClick={() => setIsUpdateDialogOpen(true)}
						className="gap-1 bg-amber-600 text-white shadow-sm hover:bg-amber-700 disabled:bg-slate-300"
					>
						<Icon icon="mdi:pencil-outline" />
						Update Selected
					</Button>
					<Button
						size="sm"
						disabled={selectedInvoiceIds.length === 0}
						onClick={handleOpenExportPreview}
						className="gap-1 bg-sky-600 text-white shadow-sm hover:bg-sky-700 disabled:bg-slate-300"
					>
						<Icon icon="mdi:file-export-outline" />
						Export
					</Button>
					<Button
						size="sm"
						onClick={() => setIsPaymentDialogOpen(true)}
						disabled={!activeCycle}
						className="gap-1 bg-sky-600 text-white shadow-sm hover:bg-sky-700 disabled:bg-slate-300"
					>
						<Icon icon="mdi:cash-plus" />
						Payment
					</Button>
				</div>
			</div>

			<InvoiceBulkUpdateDialog
				open={isUpdateDialogOpen}
				onOpenChange={setIsUpdateDialogOpen}
				selectedIds={selectedInvoiceIds}
				onSuccess={() => onToggleAll(false)}
			/>
			<CyclePaymentDialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen} cycle={activeCycle} />

			<div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
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
					typeOptions: INVOICE_FILTER_TYPE_OPTIONS,
					fieldOptions: INVOICE_FILTER_FIELD_OPTIONS,
					typeValue: typeFilter,
					fieldValue: fieldFilter,
					searchValue,
					onTypeChange: onTypeFilterChange,
					onFieldChange: onFieldFilterChange,
					onSearchChange,
					optionsByField: {
						type: INVOICE_TYPE_OPTIONS,
					},
				}}
				sortingConfig={{
					sorting,
					onSortingChange,
				}}
				paginationConfig={{
					page: currentPage,
					pageSize,
					totalItems,
					totalPages,
					paginationItems,
					onPageChange,
					onPageSizeChange,
				}}
			/>
		</div>
	);
}
