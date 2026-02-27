import {
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	type OnChangeFn,
	type PaginationState,
	type SortingState,
	useReactTable,
} from "@tanstack/react-table";
import { useCallback, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { Icon } from "@/core/components/icon";
import { cn } from "@/core/utils";
import { TableFilterBar } from "./table-filter-bar";
import { TablePagination } from "./table-pagination";

/**
 * Configuration for the Table Filter Bar.
 * Pass this to `filterConfig` prop to enable the filter bar above the table.
 */
export type SmartTableFilterConfig = {
	/** Options for the first dropdown (e.g., Transaction Type) */
	typeOptions?: { value: string; label: string }[];
	/** Options for the second dropdown (e.g., Field Name) */
	fieldOptions?: { value: string; label: string }[];
	/** Current value of the first dropdown */
	typeValue?: string;
	/** Current value of the second dropdown */
	fieldValue?: string;
	/** Current value of the search input */
	searchValue?: string;
	/** Placeholder text for the first dropdown */
	typePlaceholder?: string;
	/** Placeholder text for the second dropdown */
	fieldPlaceholder?: string;
	/** Placeholder text for the search input */
	searchPlaceholder?: string;
	/** Callback when first dropdown value changes */
	onTypeChange?: (value: string) => void;
	/** Callback when second dropdown value changes */
	onFieldChange?: (value: string) => void;
	/** Callback when search input value changes */
	onSearchChange?: (value: string) => void;
	/** Callback when filter button is clicked (usually for mobile/extra filters) */
	onFilterClick?: () => void;
	/** Options for specific search fields to render a Select instead of Input */
	optionsByField?: Record<string, { value: string; label: string }[]>;
};

/**
 * Configuration for Table Sorting.
 * Pass this to `sortingConfig` prop to enable server-side sorting.
 */
export type SmartTableSortingConfig = {
	/** Current sorting state */
	sorting: SortingState;
	/** Callback when sorting changes */
	onSortingChange: OnChangeFn<SortingState>;
};

/**
 * Configuration for Table Pagination.
 * Pass this to `paginationConfig` prop to enable pagination below the table.
 * @note This component assumes server-side pagination primarily.
 */
export type SmartTablePaginationConfig = {
	/** Current page number (1-indexed) */
	page: number;
	/** Number of items per page */
	pageSize: number;
	/** Total number of items in the dataset */
	totalItems: number;
	/** Total number of pages */
	totalPages: number;
	/** Callback when page changes */
	onPageChange: (page: number) => void;
	/** Callback when page size changes */
	onPageSizeChange: (pageSize: number) => void;
	/** Array of page numbers to display (logic handled by parent) */
	paginationItems: Array<number | "...">;
};

type SmartDataTableProps<T> = {
	/** The data to display in the table */
	data: T[];
	/**
	 * Column definitions compatible with TanStack Table.
	 * @example
	 * {
	 *   header: 'Amount',
	 *   accessorKey: 'amount',
	 * }
	 */
	columns: ColumnDef<T, any>[];
	/** Configuration object for the top filter bar. If omitted, filter bar is hidden. */
	filterConfig?: SmartTableFilterConfig;
	/** Configuration object for server-side sorting. If omitted, sorting is client-side or disabled. */
	sortingConfig?: SmartTableSortingConfig;
	/** Configuration object for the bottom pagination. If omitted, pagination is hidden. */
	paginationConfig?: SmartTablePaginationConfig;
	/** Additional class names for the wrapper container */
	className?: string;
	/** Max height for the scrollable table body container (e.g. "60vh", "480px") */
	maxBodyHeight?: string;
	/** Callback when a row is clicked */
	onRowClick?: (row: T) => void;
	/** Visual variant of the table wrapper */
	variant?: "default" | "borderless";
	/**
	 * whether to show the filter bar.
	 * If undefined, defaults to true if filterConfig is provided.
	 */
	enableFilterBar?: boolean;
};

/**
 * A reusable, "smart" data table component that integrates:
 * - **TanStack Table** for table logic and rendering.
 * - **TableFilterBar** for optional top-level filtering/searching.
 * - **TablePagination** for optional bottom-level pagination.
 *
 * Header text styling is applied via the `TableHead` styled component.
 *
 * @example
 * ```tsx
 * // 1. Define columns
 * const columns: ColumnDef<User>[] = [
 *   { header: 'Name', accessorKey: 'name' },
 *   {
 *     header: 'Status',
 *     accessorKey: 'status',
 *   }
 * ];
 *
 * // 2. Use component
 * <SmartDataTable
 *   data={users}
 *   columns={columns}
 *   filterConfig={{
 *     searchValue: search,
 *     onSearchChange: setSearch,
 *     // ... other filter props
 *   }}
 *   paginationConfig={{
 *     page: 1,
 *     totalItems: 100,
 *     // ... other pagination props
 *   }}
 * />
 * ```
 */

/** Helper to generate fixed column size styles */
const getColumnSizeStyle = (size?: number) => (size ? { width: size, minWidth: size, maxWidth: size } : undefined);

export function SmartDataTable<T extends object>({
	data,
	columns,
	filterConfig,
	sortingConfig,
	paginationConfig,
	className,
	maxBodyHeight = "60vh",
	onRowClick,
	variant = "default",
	enableFilterBar = true,
}: SmartDataTableProps<T>) {
	const scrollRef = useRef<HTMLDivElement>(null);
	const [canScrollLeft, setCanScrollLeft] = useState(false);
	const [canScrollRight, setCanScrollRight] = useState(false);
	const rafRef = useRef<number | null>(null);

	// show filter bar
	const showFilterBar = enableFilterBar !== false && !!filterConfig;

	const paginationState: PaginationState | undefined = paginationConfig
		? { pageIndex: paginationConfig.page - 1, pageSize: paginationConfig.pageSize }
		: undefined;

	const updateScrollState = useCallback(() => {
		if (rafRef.current) {
			cancelAnimationFrame(rafRef.current);
			rafRef.current = null;
		}
		rafRef.current = requestAnimationFrame(() => {
			const el = scrollRef.current;
			if (!el) return;
			const { scrollLeft, clientWidth, scrollWidth } = el;
			setCanScrollLeft(scrollLeft > 0);
			setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
		});
	}, []);

	const scrollByAmount = useCallback((delta: number) => {
		const el = scrollRef.current;
		if (!el) return;
		el.scrollBy({ left: delta, behavior: "smooth" });
	}, []);

	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		// Pagination configuration
		manualPagination: !!paginationConfig,
		pageCount: paginationConfig?.totalPages,
		// Sorting configuration
		manualSorting: !!sortingConfig,
		autoResetPageIndex: false,
		state: {
			pagination: paginationState,
			sorting: sortingConfig?.sorting,
		},
		onPaginationChange: paginationConfig
			? (updater) => {
					const prev = {
						pageIndex: paginationConfig.page - 1,
						pageSize: paginationConfig.pageSize,
					};
					const next = typeof updater === "function" ? updater(prev) : updater;

					if (next.pageIndex !== prev.pageIndex) {
						paginationConfig.onPageChange(next.pageIndex + 1);
					}
					if (next.pageSize !== prev.pageSize) {
						paginationConfig.onPageSizeChange(next.pageSize);
					}
				}
			: undefined,
		onSortingChange: sortingConfig?.onSortingChange,
		getRowId: (row: any, index) => String(row?.id ?? index),
	});

	// Manage "Go to" input state locally to allow typing without immediate page jump
	const [goToPageValue, setGoToPageValue] = useState(paginationConfig ? String(paginationConfig.page) : "");

	// Sync local input state when page changes externally
	const currentPage = paginationConfig?.page;
	useEffect(() => {
		if (currentPage !== undefined) {
			setGoToPageValue(String(currentPage));
		}
	}, [currentPage]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		updateScrollState();
	}, [updateScrollState, data, columns]);

	useEffect(() => {
		window.addEventListener("resize", updateScrollState);
		return () => {
			window.removeEventListener("resize", updateScrollState);
			if (rafRef.current) {
				cancelAnimationFrame(rafRef.current);
				rafRef.current = null;
			}
		};
	}, [updateScrollState]);

	return (
		<div className={cn("flex flex-col gap-4", className)}>
			{showFilterBar && filterConfig && (
				<TableFilterBar
					typeOptions={filterConfig.typeOptions || []}
					fieldOptions={filterConfig.fieldOptions || []}
					typeValue={filterConfig.typeValue}
					fieldValue={filterConfig.fieldValue}
					searchValue={filterConfig.searchValue}
					typePlaceholder={filterConfig.typePlaceholder}
					fieldPlaceholder={filterConfig.fieldPlaceholder}
					searchPlaceholder={filterConfig.searchPlaceholder}
					onTypeChange={filterConfig.onTypeChange}
					onFieldChange={filterConfig.onFieldChange}
					onSearchChange={filterConfig.onSearchChange}
					onFilterClick={filterConfig.onFilterClick}
					optionsByField={filterConfig.optionsByField}
				/>
			)}

			<div className="relative flex-1 min-h-0">
				{canScrollLeft && (
					<ScrollArrowButton $side="left" type="button" onClick={() => scrollByAmount(-240)} aria-label="Scroll left">
						<Icon icon="mdi:chevron-left" size={16} />
					</ScrollArrowButton>
				)}
				{canScrollRight && (
					<ScrollArrowButton $side="right" type="button" onClick={() => scrollByAmount(240)} aria-label="Scroll right">
						<Icon icon="mdi:chevron-right" size={16} />
					</ScrollArrowButton>
				)}
				<div
					className="h-full overflow-auto w-full"
					style={{ maxHeight: maxBodyHeight }}
					ref={scrollRef}
					onScroll={updateScrollState}
				>
					<div
						className={cn(
							"min-w-full inline-block align-middle",
							variant !== "borderless" && "border border-gray-300 rounded",
						)}
					>
						<Table>
							<TableHead>
								{table.getHeaderGroups().map((headerGroup) => (
									<tr key={headerGroup.id}>
										{headerGroup.headers.map((header) => {
											const canSort = !!sortingConfig && header.column.getCanSort();
											const sortState = header.column.getIsSorted();
											const classNames = cn(
												"px-3 py-3 text-center border-r border-gray-300 last:border-r-0",
												canSort && "cursor-pointer select-none",
												header.column.columnDef.meta?.headerClassName,
											);
											const sizeStyle = getColumnSizeStyle(header.column.columnDef.size);
											return (
												<th
													key={header.id}
													className={classNames}
													style={sizeStyle}
													onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
												>
													<div className="inline-flex items-center justify-center gap-1">
														{header.isPlaceholder
															? null
															: flexRender(header.column.columnDef.header, header.getContext())}
														{canSort &&
															(sortState === "asc" ? (
																<Icon icon="mdi:arrow-up" size={14} />
															) : sortState === "desc" ? (
																<Icon icon="mdi:arrow-down" size={14} />
															) : (
																<Icon icon="mdi:unfold-more-horizontal" size={14} className="opacity-40" />
															))}
													</div>
												</th>
											);
										})}
									</tr>
								))}
							</TableHead>
							<TableBody>
								{table.getRowModel().rows.length === 0 ? (
									<tr>
										<td colSpan={table.getAllLeafColumns().length} className="px-3 py-6 text-center text-gray-500">
											No data
										</td>
									</tr>
								) : (
									table.getRowModel().rows.map((row) => (
										<TableRow
											key={row.id}
											onClick={onRowClick ? () => onRowClick(row.original) : undefined}
											className={cn(onRowClick && "cursor-pointer hover:bg-gray-50")}
										>
											{row.getVisibleCells().map((cell) => {
												const classNames = cn(
													"px-3 py-2 border-r border-gray-300 last:border-r-0",
													cell.column.columnDef.meta?.bodyClassName,
												);
												const sizeStyle = getColumnSizeStyle(cell.column.columnDef.size);
												return (
													<td key={cell.id} className={classNames} style={sizeStyle}>
														{flexRender(cell.column.columnDef.cell, cell.getContext())}
													</td>
												);
											})}
										</TableRow>
									))
								)}
							</TableBody>
						</Table>
					</div>
				</div>
			</div>

			{paginationConfig && (
				<TablePagination
					pages={paginationConfig.paginationItems}
					currentPage={paginationConfig.page}
					totalPages={paginationConfig.totalPages}
					totalItems={paginationConfig.totalItems}
					pageSize={paginationConfig.pageSize}
					pageSizeOptions={[10, 20, 50]}
					goToValue={goToPageValue}
					onPrev={table.getCanPreviousPage() ? () => table.previousPage() : undefined}
					onNext={table.getCanNextPage() ? () => table.nextPage() : undefined}
					onPageChange={(p) => table.setPageIndex(p - 1)}
					onPageSizeChange={(s) => table.setPageSize(s)}
					onGoToChange={setGoToPageValue}
					onGoToSubmit={(page) => table.setPageIndex(page - 1)}
				/>
			)}
		</div>
	);
}

//#region Styled Components
const ScrollArrowButton = styled.button<{ $side: "left" | "right" }>`
	position: absolute;
	top: 50%;
	${({ $side }) => ($side === "left" ? "left: 6px;" : "right: 6px;")}
	transform: translateY(-50%);
	width: 28px;
	height: 28px;
	border: 1px solid ${({ theme }) => theme.colors.palette.gray[300]};
	border-radius: 50%;
	background: ${({ theme }) => theme.colors.common.white};
	color: ${({ theme }) => theme.colors.palette.gray[600]};
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
	z-index: 20;

	&:hover {
		background: ${({ theme }) => theme.colors.palette.gray[100]};
	}
`;

const Table = styled.table.attrs({
	className: "min-w-full text-sm",
})``;

const TableHead = styled.thead.attrs({
	className: "bg-gray-100 border-b border-gray-300 text-md text-black",
})``;

const TableBody = styled.tbody.attrs({
	className: "divide-y divide-gray-300",
})`
	tr:nth-child(even) {
		background-color: rgb(249, 250, 251);
	}
`;

const TableRow = styled.tr.attrs({
	className: "hover:!bg-blue-50 transition-colors",
})``;
//#endregion
