import { PaginationStatus, usePagination, UsePaginationOptions } from "@/core/hooks/use-pagination";
import { Pagination } from "@/core/types/pagination";
import { VirtualList } from "@/core/components/common/virtual-list/virtual-list";
import React, { forwardRef, useImperativeHandle } from "react";

type EmptyBuilder = () => React.ReactNode;
type SeparatorBuilder<T> = (index: number, item: T) => React.ReactNode;
type LoadingFirstPageBuilder = () => React.ReactNode;
type LoadingMoreBuilder = () => React.ReactNode;
type FirstPageErrorBuilder = (error: string | null, onRetry: () => void) => React.ReactNode;
type SubsequentPageErrorBuilder = (error: string | null, onRetry: () => void) => React.ReactNode;
type EndBuilder = () => React.ReactNode;
type ItemBuilder<T> = (index: number, item: T) => React.ReactNode;

export interface PagedListRef<T> {
	updatePagination: (pagination: Pagination<T>, options?: { setLoadingFirstPage?: boolean; delayMs?: number }) => void;
}

type PagedListProps<T> = {
	itemKey: (item: T) => string;
	itemBuilder: ItemBuilder<T>;
	pagination?: UsePaginationOptions<T>["initialPagination"];
	className?: string;
	emptyBuilder?: EmptyBuilder;
	loadingFirstPageBuilder?: LoadingFirstPageBuilder;
	loadingMoreBuilder?: LoadingMoreBuilder;
	separatorBuilder?: SeparatorBuilder<T>;
	firstPageErrorBuilder?: FirstPageErrorBuilder;
	subsequentPageErrorBuilder?: SubsequentPageErrorBuilder;
	endBuilder?: EndBuilder;
	onInitial: UsePaginationOptions<T>["onInitial"];
	onRefresh: UsePaginationOptions<T>["onRefresh"];
	onLoadMore: UsePaginationOptions<T>["onLoadMore"];
	invisibleItemsThreshold?: number;
	height?: string | number;
	itemSize?: number | ((item: T, index: number) => number);
};

function InnerPagedList<T>(props: PagedListProps<T>, ref: React.ForwardedRef<PagedListRef<T>>) {
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
		renderSeparator: separatorBuilder ? ({ index, data }) => separatorBuilder(index, data) : undefined,
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
		<VirtualList<T>
			data={statePagination.list}
			height={height}
			overscan={invisibleItemsThreshold}
			className={className}
			{...(typeof props.itemSize === "function"
				? {
						getItemHeight: (item: T, index: number) =>
							(props.itemSize as (item: T, index: number) => number)(item, index),
					}
				: { estimateSize: typeof props.itemSize === "number" ? props.itemSize : 50 })}
			renderItem={(item, style) => {
				const index = statePagination.list.indexOf(item);
				return (
					<div key={itemKey(item)} style={style}>
						{renderPagedItem(index)}
						{renderPagedStatus(index)}
					</div>
				);
			}}
		/>
	);
}

export const PagedList = forwardRef(InnerPagedList) as <T>(
	props: PagedListProps<T> & { ref?: React.Ref<PagedListRef<T>> },
) => React.ReactElement;
