import type { OnChangeFn, SortingState } from "@tanstack/react-table";
import { useCallback, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { SmartDataTable, SummaryStatCard } from "@/core/components/common";
import Icon from "@/core/components/icon/icon";
import invoiceService from "@/core/api/services/invoice-service";
import type { SummaryStatCardData } from "@/core/types/common";
import { getCycleStatusCardColor, type Cycle, type CyclePayment } from "@/core/types/cycle";
import type { Invoice, InvoiceExportPreviewRow } from "@/core/types/invoice";
import { BackButton } from "@/core/components/common";
import { Button } from "@/core/ui/button";
import { Text } from "@/core/ui/typography";
import { formatFlexibleDisplayDate } from "@/core/utils/date-display";
import { toast } from "sonner";
import { INVOICE_FILTER_FIELD_OPTIONS } from "../constants/constants";
import { useCyclePayments } from "../hooks/use-cycle-payments";
import { useInvoiceSelection } from "../hooks/use-invoice-selection";
import { formatKHR } from "../utils/formatters";
import { CyclePaymentDialog } from "./cycle-payment-dialog";
import { InvoiceBulkUpdateDialog } from "./invoice-bulk-update-dialog";
import { getInvoiceColumns } from "./invoice-columns";
import { getPaymentColumns } from "./payment-columns";

type InvoiceContentProps = {
	pagedData: Invoice[];
	summaryCards: SummaryStatCardData[];
	activeInvoiceLabel?: string | null;
	fieldFilter: string;
	searchValue: string;
	currentPage: number;
	pageSize: number;
	totalItems: number;
	totalPages: number;
	paginationItems: Array<number | "...">;
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

const resolveBulkUpdateInitialValues = (invoices: Invoice[]) => {
	const firstInvoice = invoices[0];
	const hasSameCustomerName =
		invoices.length > 0 && invoices.every((invoice) => invoice.customerName === firstInvoice?.customerName);

	return {
		customerName: hasSameCustomerName ? firstInvoice?.customerName : undefined,
	};
};

const resetInvoiceSelection = (row: Invoice, id: string): InvoiceExportPreviewRow => {
	const invoiceSelection = {
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
	return invoiceSelection;
};

const buildExportPreviewState = (invoices: Invoice[]) => ({
	selectedInvoiceIds: invoices.map((invoice) => invoice.id),
	previewRows: invoices.map((invoice) => resetInvoiceSelection(invoice, invoice.id)),
});

export function InvoiceContent({
	pagedData,
	summaryCards,
	activeInvoiceLabel,
	fieldFilter,
	searchValue,
	currentPage,
	pageSize,
	totalItems,
	totalPages,
	paginationItems,
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
	const location = useLocation();
	const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
	const [updateTargetIds, setUpdateTargetIds] = useState<string[]>([]);
	const [updateInitialValues, setUpdateInitialValues] = useState<{ customerName?: string }>({});
	const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
	const [isPaymentHistoryDialogOpen, setIsPaymentHistoryDialogOpen] = useState(false);
	const [isConvertDialogOpen, setIsConvertDialogOpen] = useState(false);
	const [exportingPaymentId, setExportingPaymentId] = useState<string | null>(null);
	const { payments, isLoadingPayments } = useCyclePayments(activeCycle?.id);
	// This enrichment flow was used to backfill invoice balances from the export-detail endpoint
	// because the invoice list API does not return balance. It is currently disabled together
	// with the "Remaining Balance" column to keep the invoice table on the simpler list payload.
	// const visibleInvoiceIds = useMemo(() => pagedData.map((invoice) => invoice.id), [pagedData]);
	// const { data: visibleInvoiceDetails = [] } = useQuery({
	// 	queryKey: ["invoice-export-lines", visibleInvoiceIds],
	// 	queryFn: () => invoiceService.listInvoiceDetails(visibleInvoiceIds),
	// 	enabled: visibleInvoiceIds.length > 0,
	// });
	// const invoiceBalanceByRefNo = useMemo(() => {
	// 	const balances = new Map<string, number>();
	//
	// 	for (const line of visibleInvoiceDetails) {
	// 		const refNo = line.refNo?.trim();
	// 		if (!refNo) continue;
	//
	// 		const previewRow = toInvoiceExportPreviewRow(line);
	// 		const balance = getPreviewRowBalance(previewRow, getPreviewRowOriginalAmount(previewRow));
	// 		if (balance === null || balance === undefined) continue;
	//
	// 		balances.set(refNo, Math.max(balances.get(refNo) ?? 0, balance));
	// 	}
	//
	// 	return balances;
	// }, [visibleInvoiceDetails]);
	// const tableInvoices = useMemo(
	// 	() =>
	// 		pagedData.map((invoice) => ({
	// 			...invoice,
	// 			balance: invoiceBalanceByRefNo.get(invoice.refNo) ?? invoice.balance ?? null,
	// 		})),
	// 	[invoiceBalanceByRefNo, pagedData],
	// );
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
	const isClosedCycle = activeCycle?.status === "CLOSED";

	const getSelectedInvoices = useCallback(
		(ids: string[]) =>
			ids.map((id) => selectedInvoiceById[id] ?? rowById.get(id)).filter((invoice): invoice is Invoice => !!invoice),
		[selectedInvoiceById, rowById],
	);

	const handleOpenBulkUpdate = useCallback(() => {
		if (selectedInvoiceIds.length === 0) return;
		const selectedInvoices = getSelectedInvoices(selectedInvoiceIds);

		setUpdateTargetIds(selectedInvoiceIds);
		setUpdateInitialValues(resolveBulkUpdateInitialValues(selectedInvoices));
		setIsUpdateDialogOpen(true);
	}, [getSelectedInvoices, selectedInvoiceIds]);

	const handleOpenSingleUpdate = useCallback((invoice: Invoice) => {
		setUpdateTargetIds([invoice.id]);
		setUpdateInitialValues({
			customerName: invoice.customerName,
		});
		setIsUpdateDialogOpen(true);
	}, []);

	const handlePrintInvoiceA5 = useCallback(
		(invoice: Invoice) => {
			navigate(`/dashboard/invoice/export-preview?ids=${invoice.id}&paper=a5`, {
				state: {
					selectedInvoiceIds: [invoice.id],
					customerId: activeCycle?.customerId,
					customerName: activeCycle?.customerName,
					cycleId: activeCycle?.id,
					autoPrint: true,
					initialPaperSizeMode: "a5",
					initialOrientationMode: "landscape",
				},
			});
		},
		[activeCycle, navigate],
	);

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
				onPrintA5One: handlePrintInvoiceA5,
			}),
		[
			allSelected,
			partiallySelected,
			selectedIdSet,
			onToggleAll,
			onToggleOne,
			handleOpenSingleUpdate,
			handlePrintInvoiceA5,
		],
	);
	const cycleSummaryCards = useMemo<SummaryStatCardData[]>(
		() =>
			activeCycle
				? [
						{
							label: "Status",
							value: activeCycle.status,
							color: getCycleStatusCardColor(activeCycle.status),
							icon: "mdi:information-outline",
						},
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
							label: "Remaining Balance",
							value: formatKHR((activeCycle.totalAmount ?? 0) - (activeCycle.totalPaidAmount ?? 0)),
							color: "bg-amber-500",
							icon: "mdi:cash-remove",
						},
						{
							label: "Start Date",
							value: formatFlexibleDisplayDate(activeCycle.startDate),
							color: "bg-slate-500",
							icon: "mdi:calendar-range",
						},
						{
							label: "End Date",
							value: formatFlexibleDisplayDate(activeCycle.endDate),
							color: "bg-slate-500",
							icon: "mdi:calendar-range",
						},
					]
				: [],
		[activeCycle],
	);
	const allSummaryCards = useMemo(() => [...summaryCards, ...cycleSummaryCards], [summaryCards, cycleSummaryCards]);

	const openExportPreview = useCallback(
		(
			invoices: Invoice[],
			options?: {
				autoPrint?: boolean;
				receiptPaymentAmount?: number;
				receiptPaymentCode?: string;
				receiptPaymentDate?: string;
				mode?: "invoice" | "receipt";
				paper?: "a4" | "a5" | "letter";
				orientation?: "portrait" | "landscape";
				template?: "standard" | "compact" | "detailed";
				sort?: "default" | "date-desc" | "date-asc" | "customer-asc" | "balance-desc";
			},
		) => {
			if (invoices.length === 0) return;

			const exportState = {
				...buildExportPreviewState(invoices),
				customerId: activeCycle?.customerId,
				customerName: activeCycle?.customerName,
				cycleId: activeCycle?.id,
				returnPath: `${location.pathname}${location.search}`,
				receiptPaymentAmount: options?.receiptPaymentAmount,
				receiptPaymentCode: options?.receiptPaymentCode,
				receiptPaymentDate: options?.receiptPaymentDate,
				autoPrint: options?.autoPrint ?? false,
			};
			const searchParams = new URLSearchParams();
			searchParams.set("ids", exportState.selectedInvoiceIds.join(","));
			if (options?.mode) searchParams.set("mode", options.mode);
			if (options?.paper) searchParams.set("paper", options.paper);
			if (options?.orientation) searchParams.set("orientation", options.orientation);
			if (options?.template) searchParams.set("template", options.template);
			if (options?.sort) searchParams.set("sort", options.sort);

			const previewPath =
				options?.mode === "receipt" ? "/dashboard/invoice/receipt-preview" : "/dashboard/invoice/export-preview";
			navigate(`${previewPath}?${searchParams.toString()}`, {
				state: exportState,
			});
		},
		[activeCycle, location.pathname, location.search, navigate],
	);

	const handleOpenExportPreview = () => {
		openExportPreview(getSelectedInvoices(selectedInvoiceIds));
	};

	const handleOpenInvoiceExportPreview = useCallback(
		(invoice: Invoice) => {
			openExportPreview([invoice]);
		},
		[openExportPreview],
	);
	const handleExportPaymentReceipt = useCallback(
		async (payment: CyclePayment) => {
			if (!activeCycle) return;

			try {
				setExportingPaymentId(payment.id);
				const invoices = await invoiceService.getAllInvoices({
					size: 1000,
					customerId: activeCycle.customerId,
					cycleId: activeCycle.id,
					sort: "date,desc",
				});
				if (invoices.length === 0) {
					toast.error("No invoices found for this cycle");
					return;
				}
				openExportPreview(invoices, {
					mode: "receipt",
					autoPrint: true,
					receiptPaymentAmount: payment.amount,
					receiptPaymentCode: payment.code,
					receiptPaymentDate: payment.paymentDate,
					paper: "a5",
					orientation: "landscape",
					template: "standard",
					sort: "default",
				});
			} finally {
				setExportingPaymentId(null);
			}
		},
		[activeCycle, openExportPreview],
	);
	const paymentColumns = useMemo(
		() =>
			getPaymentColumns({
				onExportReceipt: activeCycle ? handleExportPaymentReceipt : undefined,
				exportingPaymentId,
			}),
		[activeCycle, handleExportPaymentReceipt, exportingPaymentId],
	);
	const filterConfig = useMemo(
		() => ({
			showTypeFilter: false,
			showFieldFilter: true,
			fieldOptions: INVOICE_FILTER_FIELD_OPTIONS,
			fieldValue: fieldFilter,
			searchValue,
			onFieldChange: onFieldFilterChange,
			onSearchChange,
		}),
		[fieldFilter, onFieldFilterChange, onSearchChange, searchValue],
	);
	const paginationConfig = useMemo(
		() => ({
			page: currentPage,
			pageSize,
			totalItems,
			totalPages,
			paginationItems,
			onPageChange,
			onPageSizeChange,
		}),
		[currentPage, onPageChange, onPageSizeChange, pageSize, paginationItems, totalItems, totalPages],
	);

	return (
		<div className={`flex w-full flex-col gap-4 ${isLoading ? "opacity-60 pointer-events-none" : ""}`}>
			<div className="flex flex-wrap items-center justify-between gap-2 shrink-0 border-b border-slate-200 pb-2">
				<div className="flex items-center gap-2">
					{onBack && <BackButton onClick={onBack} />}
					<Text variant="body2" className="text-muted-foreground">
						{activeInvoiceLabel ? `Invoices for ${activeInvoiceLabel}` : "Manage customer invoices"}
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
						disabled={!activeCycle || isClosedCycle}
						className="gap-1 bg-sky-600 text-white shadow-sm hover:bg-sky-700 disabled:bg-slate-300"
					>
						<Icon icon="mdi:cash-plus" />
						Payment
					</Button>
					<Button
						size="sm"
						onClick={() => setIsConvertDialogOpen(true)}
						disabled={!activeCycle || isClosedCycle}
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
				onSuccess={() => onToggleAll(false)}
			/>

			<CyclePaymentDialog
				open={isPaymentDialogOpen}
				onOpenChange={setIsPaymentDialogOpen}
				cycle={activeCycle}
				defaultTab="payment"
				hideTabSwitch
				onExportReceipt={handleExportPaymentReceipt}
				exportingPaymentId={exportingPaymentId}
			/>
			<CyclePaymentDialog
				open={isPaymentHistoryDialogOpen}
				onOpenChange={setIsPaymentHistoryDialogOpen}
				cycle={activeCycle}
				historyOnly
				onExportReceipt={handleExportPaymentReceipt}
				exportingPaymentId={exportingPaymentId}
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
						<Text className="text-sm font-semibold">Payment Histories</Text>
						{payments.length > displayedPayments.length && (
							<Button size="sm" variant="secondary" onClick={() => setIsPaymentHistoryDialogOpen(true)}>
								View more
							</Button>
						)}
					</div>
					<SmartDataTable
						className="min-w-0 max-h-[280px] overflow-hidden rounded-md border border-slate-200"
						maxBodyHeight="280px"
						minBodyHeight="0"
						variant="borderless"
						data={displayedPayments}
						columns={paymentColumns}
					/>
					{isLoadingPayments && <Text className="text-xs text-slate-500">Loading payments...</Text>}
				</div>
			)}

			<SmartDataTable
				className="min-h-0 w-full"
				minBodyHeight="0"
				fillAvailableHeight={false}
				data={pagedData}
				columns={columns}
				onRowClick={handleOpenInvoiceExportPreview}
				filterConfig={filterConfig}
				sortingConfig={{
					sorting,
					onSortingChange,
				}}
				paginationConfig={paginationConfig}
			/>
		</div>
	);
}
