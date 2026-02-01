import type React from "react";
import { forwardRef, useImperativeHandle, useMemo } from "react";
import styled from "styled-components";
import { VirtualList } from "@/core/components/common/virtual-list/virtual-list";
import { PaginationStatus, type UsePaginationOptions, usePagination } from "@/core/hooks/use-pagination";
import type { Pagination } from "@/core/types/pagination";

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
		invisibleItemsThreshold = 5,
		columns = 4,
		gap = 12,
		itemHeight = 240,
		height = "100%",
	} = props;

	const {
		pagination: statePagination,
		status,
		handleInitial,
		renderItemWithoutStatus,
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
		return loadingFirstPageBuilder?.();
	}

	if (status === PaginationStatus.FIRST_PAGE_ERROR) {
		return firstPageErrorBuilder?.(statePagination.error ?? null, handleInitial);
	}

	if (status === PaginationStatus.NO_ITEMS_FOUND || statePagination.list.length === 0) {
		return emptyBuilder?.();
	}

	return (
		<VirtualList<T[]>
			data={rows}
			height={height}
			estimateSize={rowHeight}
			overscan={invisibleItemsThreshold}
			className={className}
			containment="strict"
			renderItem={(rowItems, style) => {
				const firstItemIndex = rows.indexOf(rowItems) * columns;
				// const isLastRow = rows.indexOf(rowItems) === rows.length - 1;

				return (
					<GridRow key={firstItemIndex} $columns={columns} $gap={gap} style={style}>
						{rowItems.map((item, colIndex) => {
							const itemIndex = firstItemIndex + colIndex;
							return <div key={itemKey(item)}>{renderItemWithoutStatus(itemIndex)}</div>;
						})}
					</GridRow>
				);
			}}
			renderEndBuilder={() => (
				<StatusWrapper className={`pt-${gap}`}>{renderPagedStatus(statePagination.list.length - 1)}</StatusWrapper>
			)}
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

const StatusWrapper = styled.div`
    grid-column: 1 / -1;
		align-items: center;
		justify-content: center;
		display: flex;
    width: 100%;
`;
//#endregion
