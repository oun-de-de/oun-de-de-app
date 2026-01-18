import {
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	type OnChangeFn,
	type PaginationState,
	type SortingState,
	useReactTable,
} from "@tanstack/react-table";
import { useEffect, useState } from "react";
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
	 * Use `meta: { className: '...' }` to style specific columns (header and cell).
	 * @example
	 * {
	 *   header: 'Amount',
	 *   accessorKey: 'amount',
	 *   meta: { className: 'text-right font-bold' }
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
};

/**
 * A reusable, "smart" data table component that integrates:
 * - **TanStack Table** for table logic and rendering.
 * - **TableFilterBar** for optional top-level filtering/searching.
 * - **TablePagination** for optional bottom-level pagination.
 *
 * It supports custom styling for columns via `meta.className` in the column definition.
 * Header text is enforced to be white (`!text-white`) for consistency.
 *
 * @example
 * ```tsx
 * // 1. Define columns
 * const columns: ColumnDef<User>[] = [
 *   { header: 'Name', accessorKey: 'name' },
 *   {
 *     header: 'Status',
 *     accessorKey: 'status',
 *     meta: { className: 'text-center text-blue-600' } // Custom styling
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
export function SmartDataTable<T extends object>({
	data,
	columns,
	filterConfig,
	sortingConfig,
	paginationConfig,
	className,
}: SmartDataTableProps<T>) {
	const paginationState: PaginationState | undefined = paginationConfig
		? { pageIndex: paginationConfig.page - 1, pageSize: paginationConfig.pageSize }
		: undefined;

	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		// Pagination configuration
		manualPagination: !!paginationConfig,
		pageCount: paginationConfig?.totalPages,
		// Sorting configuration
		manualSorting: !!sortingConfig,
		state: {
			pagination: paginationState,
			sorting: sortingConfig?.sorting,
		},
		onPaginationChange: paginationConfig
			? (updater) => {
					// Use current table state to avoid closure staleness
					const prev = table.getState().pagination;
					const next = typeof updater === "function" ? updater(prev) : updater;

					paginationConfig.onPageChange(next.pageIndex + 1);
					if (next.pageSize !== prev.pageSize) {
						paginationConfig.onPageSizeChange(next.pageSize);
					}
				}
			: undefined,
		onSortingChange: sortingConfig?.onSortingChange,
		getRowId: (row: any, index) => String(row?.id ?? index),
	});

	const getColClass = (colDef: any) => colDef?.meta?.className ?? "";

	// Manage "Go to" input state locally to allow typing without immediate page jump
	const [goToPageValue, setGoToPageValue] = useState(paginationConfig ? String(paginationConfig.page) : "");

	// Sync local input state when page changes externally
	const currentPage = paginationConfig?.page;
	useEffect(() => {
		if (currentPage !== undefined) {
			setGoToPageValue(String(currentPage));
		}
	}, [currentPage]);

	return (
		<div className={`space-y-4 ${className || ""}`}>
			{filterConfig && (
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
				/>
			)}

			<div className="overflow-x-auto rounded border border-gray-300">
				<table className="min-w-full text-sm">
					<thead className="bg-gray-100 border-b border-gray-300 text-md text-black">
						{table.getHeaderGroups().map((headerGroup) => (
							<tr key={headerGroup.id}>
								{headerGroup.headers.map((header) => {
									const colClass = getColClass(header.column.columnDef);
									return (
										<th
											key={header.id}
											className={`px-3 py-3 text-center border-r border-gray-300 last:border-r-0 ${colClass}`}
											onClick={header.column.getToggleSortingHandler()}
										>
											{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
										</th>
									);
								})}
							</tr>
						))}
					</thead>
					<tbody className="divide-y divide-gray-300">
						{table.getRowModel().rows.length === 0 ? (
							<tr>
								<td colSpan={table.getAllLeafColumns().length} className="px-3 py-6 text-center text-gray-500">
									No data
								</td>
							</tr>
						) : (
							table.getRowModel().rows.map((row) => (
								<tr key={row.id} className="hover:bg-blue-50! transition-colors">
									{row.getVisibleCells().map((cell) => {
										const colClass = getColClass(cell.column.columnDef);
										return (
											<td key={cell.id} className={`px-3 py-2 border-r border-gray-300 last:border-r-0 ${colClass}`}>
												{flexRender(cell.column.columnDef.cell, cell.getContext())}
											</td>
										);
									})}
								</tr>
							))
						)}
					</tbody>
				</table>
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
					onPrev={() => table.previousPage()}
					onNext={() => table.nextPage()}
					onPageChange={(p) => table.setPageIndex(p - 1)}
					onPageSizeChange={(s) => table.setPageSize(s)}
					onGoToChange={setGoToPageValue}
					onGoToSubmit={(page) => table.setPageIndex(page - 1)}
				/>
			)}
		</div>
	);
}
