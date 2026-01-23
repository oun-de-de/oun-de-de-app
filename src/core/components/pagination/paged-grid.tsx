import { PaginationStatus, usePagination, UsePaginationOptions } from "@/core/hooks/use-pagination";
import { Pagination } from "@/core/types/pagination";
import { VirtualList } from "@/core/components/common/virtual-list";
import React, { forwardRef, useImperativeHandle, useMemo } from "react";
import styled from "styled-components";

type EmptyBuilder = () => React.ReactNode;
type SeparatorBuilder = (index: number) => React.ReactNode;
type LoadingFirstPageBuilder = () => React.ReactNode;
type LoadingMoreBuilder = () => React.ReactNode;
type FirstPageErrorBuilder = (error: string | null, onRetry: () => void) => React.ReactNode;
type SubsequentPageErrorBuilder = (error: string | null, onRetry: () => void) => React.ReactNode;
type EndBuilder = () => React.ReactNode;

type ItemBuilder<T> = (index: number, item: T) => React.ReactNode;

export interface PagedGridRef<T> {
	updatePagination: (pagination: Pagination<T>, options?: { setLoadingFirstPage?: boolean; delayMs?: number }) => void;
}

type PagedGridProps<T> = {
	itemKey: (item: T) => string;
	itemBuilder: ItemBuilder<T>;
	pagination?: UsePaginationOptions<T>["initialPagination"];
	className?: string;
	emptyBuilder?: EmptyBuilder;
	loadingFirstPageBuilder?: LoadingFirstPageBuilder;
	loadingMoreBuilder?: LoadingMoreBuilder;
	separatorBuilder?: SeparatorBuilder;
	firstPageErrorBuilder?: FirstPageErrorBuilder;
	subsequentPageErrorBuilder?: SubsequentPageErrorBuilder;
	endBuilder?: EndBuilder;
	onInitial: UsePaginationOptions<T>["onInitial"];
	onRefresh: UsePaginationOptions<T>["onRefresh"];
	onLoadMore: UsePaginationOptions<T>["onLoadMore"];
	invisibleItemsThreshold?: number;
	columns?: number;
	gap?: number;
	itemHeight?: number;
	height?: string | number;
};

function InnerPagedGrid<T>(props: PagedGridProps<T>, ref: React.ForwardedRef<PagedGridRef<T>>) {
	const {
		itemKey,
		itemBuilder,
		className,
		emptyBuilder,
		loadingFirstPageBuilder,
		loadingMoreBuilder,
		separatorBuilder,
		firstPageErrorBuilder,
		subsequentPageErrorBuilder,
		endBuilder,
		onInitial,
		onRefresh,
		onLoadMore,
		pagination,
		invisibleItemsThreshold,
		columns = 4,
		gap = 12,
		itemHeight = 240,
		height = "100%",
	} = props;

	const {
		pagination: statePagination,
		status,
		handleInitial,
		renderPagedItem,
		updatePagination,
		renderPagedStatus,
	} = usePagination<T>({
		initialPagination: pagination,
		onInitial,
		onRefresh,
		onLoadMore,
		itemKey,
		renderItem: ({ index, data }) => itemBuilder(index, data),
		renderSeparator: separatorBuilder ? ({ index }) => separatorBuilder(index) : undefined,
		renderEmpty: emptyBuilder,
		renderLoadingFirstPage: loadingFirstPageBuilder,
		renderLoadingMore: loadingMoreBuilder,
		renderFirstPageError: firstPageErrorBuilder
			? ({ error, onRetry }) => firstPageErrorBuilder(error, onRetry)
			: undefined,
		renderSubsequentPageError: subsequentPageErrorBuilder
			? ({ error, onRetry }) => subsequentPageErrorBuilder(error, onRetry)
			: undefined,
		renderEnd: endBuilder,
		invisibleItemsThreshold,
	});

	const rows = useMemo(() => {
		const result: T[][] = [];
		for (let i = 0; i < statePagination.list.length; i += columns) {
			result.push(statePagination.list.slice(i, i + columns));
		}
		return result;
	}, [statePagination.list, columns]);

	const rowHeight = itemHeight + gap;

	useImperativeHandle(
		ref,
		() => ({
			updatePagination,
		}),
		[updatePagination],
	);

	if (status === PaginationStatus.LOADING_FIRST_PAGE) {
		return loadingFirstPageBuilder?.() || <div>Loading...</div>;
	}

	if (status === PaginationStatus.FIRST_PAGE_ERROR) {
		return (
			firstPageErrorBuilder?.(statePagination.error ?? null, handleInitial) || (
				<div>
					Error! <button onClick={handleInitial}>Retry</button>
				</div>
			)
		);
	}

	if (status === PaginationStatus.NO_ITEMS_FOUND || statePagination.list.length === 0) {
		return emptyBuilder?.() || <div>Empty</div>;
	}

	return (
		<VirtualList<T[]>
			data={rows}
			height={height}
			estimateSize={rowHeight}
			overscan={4}
			className={className}
			renderItem={(rowItems, style) => {
				const firstItemIndex = rows.indexOf(rowItems) * columns;
				const isLastRow = rows.indexOf(rowItems) === rows.length - 1;

				return (
					<GridRow key={firstItemIndex} $columns={columns} $gap={gap} style={style}>
						{rowItems.map((item, colIndex) => {
							const itemIndex = firstItemIndex + colIndex;
							return <div key={itemKey(item)}>{renderPagedItem(itemIndex)}</div>;
						})}
						{isLastRow && (
							<StatusWrapper $columns={columns}>{renderPagedStatus(statePagination.list.length - 1)}</StatusWrapper>
						)}
					</GridRow>
				);
			}}
		/>
	);
}

// 👇 Export component có generic
export const PagedGrid = forwardRef(InnerPagedGrid) as <T>(
	props: PagedGridProps<T> & { ref?: React.Ref<PagedGridRef<T>> },
) => React.ReactElement;

//#region Styled Components
const GridRow = styled.div<{ $columns: number; $gap: number }>`
    display: grid;
    grid-template-columns: repeat(${({ $columns }) => $columns}, minmax(0, 1fr));
    gap: ${({ $gap }) => $gap}px;
    padding: 6px 0;
`;

const StatusWrapper = styled.div<{ $columns: number }>`
    grid-column: 1 / -1;
    width: 100%;
`;
//#endregion
