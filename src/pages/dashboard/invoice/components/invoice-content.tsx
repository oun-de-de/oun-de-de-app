import type { OnChangeFn, SortingState } from "@tanstack/react-table";
import { useCallback, useMemo, useState } from "react";
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
import { useCyclePayments } from "../hooks/use-cycle-payments";
import { useInvoiceSelection } from "../hooks/use-invoice-selection";
import { formatKHR } from "../utils/formatters";
import { CyclePaymentDialog } from "./cycle-payment-dialog";
import { InvoiceBulkUpdateDialog } from "./invoice-bulk-update-dialog";
import { getInvoiceColumns } from "./invoice-columns";
import { PAYMENT_COLUMNS } from "./payment-columns";

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
	const [updateTargetIds, setUpdateTargetIds] = useState<string[]>([]);
	const [updateInitialValues, setUpdateInitialValues] = useState<{ customerName?: string; type?: Invoice["type"] }>({});
	const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
	const [isPaymentHistoryDialogOpen, setIsPaymentHistoryDialogOpen] = useState(false);
	const [isConvertDialogOpen, setIsConvertDialogOpen] = useState(false);
	const { payments, isLoadingPayments } = useCyclePayments(activeCycle?.id);
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
	const displayedPayments = useMemo(() => payments.slice(0, 5), [payments]);

	const handleOpenBulkUpdate = useCallback(() => {
		if (selectedInvoiceIds.length === 0) return;
		setUpdateTargetIds(selectedInvoiceIds);
		setUpdateInitialValues({});
		setIsUpdateDialogOpen(true);
	}, [selectedInvoiceIds]);

	const handleOpenSingleUpdate = useCallback((invoice: Invoice) => {
		setUpdateTargetIds([invoice.id]);
		setUpdateInitialValues({
			customerName: invoice.customerName,
			type: invoice.type,
		});
		setIsUpdateDialogOpen(true);
	}, []);

	const handleUpdateDialogChange = useCallback((open: boolean) => {
		setIsUpdateDialogOpen(open);
		if (!open) {
			setUpdateTargetIds([]);
			setUpdateInitialValues({});
		}
	}, []);

	const columns = useMemo(
		() =>
			getInvoiceColumns({
				allSelected,
				partiallySelected,
				selectedIds: selectedIdSet,
				onToggleAll,
				onToggleOne,
				onEditOne: handleOpenSingleUpdate,
			}),
		[allSelected, partiallySelected, selectedIdSet, onToggleAll, onToggleOne, handleOpenSingleUpdate],
	);
	const cycleSummaryCards = useMemo<SummaryStatCardData[]>(
		() =>
			activeCycle
				? [
						{ label: "Status", value: activeCycle.status, color: "bg-amber-500", icon: "mdi:information-outline" },
						{
							label: "Total Amount",
							value: formatKHR(activeCycle.totalAmount),
							color: "bg-emerald-500",
							icon: "mdi:cash-multiple",
						},
						{
							label: "Total Paid",
							value: formatKHR(activeCycle.totalPaidAmount),
							color: "bg-sky-500",
							icon: "mdi:cash-check",
						},
						{
							label: "Start Date",
							value: `${activeCycle.startDate.split("T")[0]}`,
							color: "bg-violet-500",
							icon: "mdi:calendar-range",
						},
						{
							label: "End Date",
							value: `${activeCycle.endDate.split("T")[0]}`,
							color: "bg-violet-500",
							icon: "mdi:calendar-range",
						},
					]
				: [],
		[activeCycle],
	);
	const allSummaryCards = useMemo(() => [...summaryCards, ...cycleSummaryCards], [summaryCards, cycleSummaryCards]);

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
				autoPrint: true,
			},
		});
	};

	return (
		<div className={`flex w-full flex-col gap-4 ${isLoading ? "opacity-60 pointer-events-none" : ""}`}>
			<div className="flex flex-wrap items-center justify-between gap-2 shrink-0">
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
						onClick={handleOpenBulkUpdate}
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
					<Button
						size="sm"
						onClick={() => setIsConvertDialogOpen(true)}
						disabled={!activeCycle}
						className="gap-1 bg-rose-600 text-white shadow-sm hover:bg-rose-700 disabled:bg-slate-300"
					>
						<Icon icon="mdi:hand-coin-outline" />
						Convert To Loan
					</Button>
				</div>
			</div>

			<InvoiceBulkUpdateDialog
				open={isUpdateDialogOpen}
				onOpenChange={handleUpdateDialogChange}
				selectedIds={updateTargetIds}
				initialCustomerName={updateInitialValues.customerName}
				initialType={updateInitialValues.type}
				onSuccess={() => onToggleAll(false)}
			/>

			<CyclePaymentDialog
				open={isPaymentDialogOpen}
				onOpenChange={setIsPaymentDialogOpen}
				cycle={activeCycle}
				defaultTab="payment"
				hideTabSwitch
			/>
			<CyclePaymentDialog
				open={isPaymentHistoryDialogOpen}
				onOpenChange={setIsPaymentHistoryDialogOpen}
				cycle={activeCycle}
				historyOnly
			/>
			<CyclePaymentDialog
				open={isConvertDialogOpen}
				onOpenChange={setIsConvertDialogOpen}
				cycle={activeCycle}
				defaultTab="loan"
				hideTabSwitch
			/>

			<div className="grid grid-cols-1 gap-3 shrink-0 md:grid-cols-2 xl:grid-cols-4">
				{allSummaryCards.map((card, index) => (
					<SummaryStatCard key={`${card.label}-${index}`} {...card} />
				))}
			</div>

			{activeCycle && (
				<div className="min-w-0 shrink-0 space-y-2">
					<div className="flex items-center justify-between gap-2">
						<Text className="text-sm font-semibold">Payment History</Text>
						{payments.length > displayedPayments.length && (
							<Button size="sm" variant="secondary" onClick={() => setIsPaymentHistoryDialogOpen(true)}>
								View more
							</Button>
						)}
					</div>
					<SmartDataTable
						className="min-w-0 max-h-[280px] overflow-hidden rounded-md border border-slate-200"
						maxBodyHeight="280px"
						variant="borderless"
						data={displayedPayments}
						columns={PAYMENT_COLUMNS}
					/>
					{isLoadingPayments && <Text className="text-xs text-slate-500">Loading payments...</Text>}
				</div>
			)}

			<SmartDataTable
				className="flex-1 min-h-0 w-full"
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
