import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from "@tanstack/react-table";
import { TableFilterBar, TablePagination } from "@/components/common";
import styled from "styled-components";

const TableWrap = styled.div.attrs({
	className: "overflow-x-auto rounded-lg border",
})``;

const Table = styled.table.attrs({
	className: "min-w-full text-sm",
})``;

const TableHead = styled.thead.attrs({
	className: "bg-[#9e9e9e] text-xs uppercase text-white",
})``;

const TableRow = styled.tr.attrs({
	className: "hover:bg-gray-100 transition-colors",
})``;

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
export function SmartDataTable<T extends { id?: string | number } | any>({
	data,
	columns,
	filterConfig,
	paginationConfig,
	className,
}: SmartDataTableProps<T>) {
	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		manualPagination: true,
	});

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

			<TableWrap>
				<Table>
					<TableHead>
						{table.getHeaderGroups().map((headerGroup) => (
							<tr key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<th
										key={header.id}
										className={`px-3 py-2 text-left !text-white ${(header.column.columnDef.meta as any)?.className || ""}`}
									>
										{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
									</th>
								))}
							</tr>
						))}
					</TableHead>
					<tbody className="divide-y">
						{table.getRowModel().rows.map((row) => (
							<TableRow key={row.id}>
								{row.getVisibleCells().map((cell) => (
									<td key={cell.id} className={`px-3 py-2 ${(cell.column.columnDef.meta as any)?.className || ""}`}>
										{flexRender(cell.column.columnDef.cell, cell.getContext())}
									</td>
								))}
							</TableRow>
						))}
					</tbody>
				</Table>
			</TableWrap>

			{paginationConfig && (
				<TablePagination
					pages={paginationConfig.paginationItems}
					currentPage={paginationConfig.page}
					totalItems={paginationConfig.totalItems}
					pageSize={paginationConfig.pageSize}
					pageSizeOptions={[10, 20, 50]}
					goToValue={String(paginationConfig.page)}
					onPrev={() => paginationConfig.onPageChange(Math.max(1, paginationConfig.page - 1))}
					onNext={() => paginationConfig.onPageChange(Math.min(paginationConfig.totalPages, paginationConfig.page + 1))}
					onPageChange={paginationConfig.onPageChange}
					onPageSizeChange={paginationConfig.onPageSizeChange}
					onGoToChange={(value) => {
						const parsed = Number(value);
						if (!Number.isNaN(parsed)) {
							paginationConfig.onPageChange(Math.min(Math.max(parsed, 1), paginationConfig.totalPages));
						}
					}}
				/>
			)}
		</div>
	);
}
