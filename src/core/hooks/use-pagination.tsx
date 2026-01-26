import React, { useEffect, useCallback, useReducer } from "react";
import { emptyPagination, isLastPage, Pagination } from "../types/pagination";

export enum PaginationStatus {
	INITIAL = "initial",
	LOADING_FIRST_PAGE = "loadingFirstPage",
	FIRST_PAGE_ERROR = "firstPageError",
	ONGOING = "ongoing",
	LOADING_MORE = "loadingMore",
	SUBSEQUENT_PAGE_ERROR = "subsequentPageError",
	COMPLETED = "completed",
	NO_ITEMS_FOUND = "noItemsFound",
}

export function getStatus<T>(pagination: Pagination<T>): PaginationStatus {
	if (pagination.page === 0) {
		return pagination.error == null ? PaginationStatus.INITIAL : PaginationStatus.FIRST_PAGE_ERROR;
	}
	if (pagination.list.length && isLastPage(pagination)) {
		return PaginationStatus.COMPLETED;
	}
	if (pagination.total < 1 || pagination.list.length === 0) {
		return PaginationStatus.NO_ITEMS_FOUND;
	}
	if (pagination.error) {
		return PaginationStatus.SUBSEQUENT_PAGE_ERROR;
	}
	return PaginationStatus.ONGOING;
}

// Builder types
export type ItemKeyFn<T> = (item: T) => string | number;

export type RenderItemFn<T> = (params: {
	index: number;
	data: T;
	key: string | number;
	ref?: React.RefObject<HTMLElement>;
}) => React.ReactNode;

export type RenderSeparatorFn<T> = (params: { index: number; data: T }) => React.ReactNode;

export type RenderEmptyFn = () => React.ReactNode;
export type RenderLoadingFirstPageFn = () => React.ReactNode;
export type RenderLoadingMoreFn = () => React.ReactNode;
export type RenderEndFn = () => React.ReactNode;

export type RenderFirstPageErrorFn = (params: { error: string | null; onRetry: () => void }) => React.ReactNode;

export type RenderSubsequentPageErrorFn = (params: { error: string | null; onRetry: () => void }) => React.ReactNode;

// Hook options
export interface UsePaginationOptions<T> {
	onInitial: () => Promise<Pagination<T>>;
	onRefresh: () => Promise<Pagination<T>>;
	onLoadMore: (nextPage: number) => Promise<Pagination<T>>;
	invisibleItemsThreshold?: number;
	initialPagination?: Pagination<T>;
	itemKey: ItemKeyFn<T>;
	renderItem: RenderItemFn<T>;
	renderSeparator?: RenderSeparatorFn<T>;
	renderEmpty?: RenderEmptyFn;
	renderLoadingFirstPage?: RenderLoadingFirstPageFn;
	renderLoadingMore?: RenderLoadingMoreFn;
	renderFirstPageError?: RenderFirstPageErrorFn;
	renderSubsequentPageError?: RenderSubsequentPageErrorFn;
	renderEnd?: RenderEndFn;
}

export function usePagination<T>({
	onInitial,
	onRefresh,
	onLoadMore,
	invisibleItemsThreshold = 3,
	initialPagination,
	itemKey,
	renderItem,
	renderSeparator,
	renderLoadingMore,
	renderSubsequentPageError,
	renderEnd,
}: UsePaginationOptions<T>) {
	type State = {
		pagination: Pagination<T>;
		status: PaginationStatus;
		hasRequestedNextPage: boolean;
	};

	type Action =
		| { type: "INIT_REQUEST" }
		| { type: "INIT_SUCCESS"; payload: Pagination<T> }
		| { type: "REFRESH_SUCCESS"; payload: Pagination<T> }
		| { type: "LOAD_MORE_REQUEST" }
		| { type: "LOAD_MORE_SUCCESS"; payload: Pagination<T> }
		| { type: "SET_PAGINATION"; payload: Pagination<T> }
		| { type: "SET_STATUS"; payload: { status: PaginationStatus; hasRequestedNextPage: boolean } }
		| { type: "SET_HAS_REQUESTED_NEXT_PAGE"; payload: boolean };

	function reducer(state: State, action: Action): State {
		switch (action.type) {
			case "INIT_REQUEST": {
				return { ...state, status: PaginationStatus.LOADING_FIRST_PAGE };
			}
			case "INIT_SUCCESS": {
				const nextStatus = getStatus(action.payload);
				return { pagination: action.payload, status: nextStatus, hasRequestedNextPage: false };
			}
			case "REFRESH_SUCCESS": {
				const nextStatus = getStatus(action.payload);
				return { pagination: action.payload, status: nextStatus, hasRequestedNextPage: false };
			}
			case "LOAD_MORE_REQUEST": {
				return { ...state, status: PaginationStatus.LOADING_MORE };
			}
			case "LOAD_MORE_SUCCESS": {
				const nextStatus = getStatus(action.payload);
				return { pagination: action.payload, status: nextStatus, hasRequestedNextPage: false };
			}
			case "SET_PAGINATION": {
				return {
					...state,
					pagination: action.payload,
				};
			}
			case "SET_STATUS": {
				return {
					...state,
					status: action.payload.status,
					hasRequestedNextPage: action.payload.hasRequestedNextPage,
				};
			}
			case "SET_HAS_REQUESTED_NEXT_PAGE": {
				return { ...state, hasRequestedNextPage: action.payload };
			}
			default:
				return state;
		}
	}

	const [state, dispatch] = useReducer(reducer, {
		pagination: initialPagination || emptyPagination<T>(),
		status: getStatus<T>(initialPagination || emptyPagination<T>()),
		hasRequestedNextPage: false,
	});

	const { pagination, status, hasRequestedNextPage } = state;

	useEffect(() => {
		if (status === PaginationStatus.INITIAL) {
			handleInitial();
		}
	}, []);

	function updatePagination(newPagination: Pagination<T>) {
		dispatch({ type: "SET_PAGINATION", payload: newPagination });
		updateStatus(getStatus(newPagination), true);
	}

	const updateStatus = useCallback(
		(newStatus: PaginationStatus, forcedReload = false) => {
			const hasChanged = status !== newStatus || forcedReload;

			if (hasChanged) {
				dispatch({
					type: "SET_STATUS",
					payload: {
						status: newStatus,
						hasRequestedNextPage: newStatus === PaginationStatus.ONGOING ? false : hasRequestedNextPage,
					},
				});
			}
		},
		[status, hasRequestedNextPage, dispatch],
	);

	const handleInitial = useCallback(async () => {
		dispatch({ type: "INIT_REQUEST" });
		const result = await onInitial();
		dispatch({ type: "INIT_SUCCESS", payload: result });
	}, [onInitial]);

	const handleRefresh = useCallback(async () => {
		const result = await onRefresh();
		dispatch({ type: "REFRESH_SUCCESS", payload: result });
	}, [onRefresh]);

	const handleLoadMore = useCallback(async () => {
		dispatch({ type: "LOAD_MORE_REQUEST" });
		const result = await onLoadMore(pagination.page + 1);
		dispatch({ type: "LOAD_MORE_SUCCESS", payload: result });
	}, [onLoadMore, pagination.page]);

	// Trigger load more when scroll near end
	const checkLoadMore = useCallback(
		(index: number) => {
			if (status === PaginationStatus.ONGOING && !hasRequestedNextPage) {
				const triggerIndex = Math.max(0, pagination.list.length - invisibleItemsThreshold);
				if (!isLastPage(pagination) && index === triggerIndex) {
					dispatch({ type: "SET_HAS_REQUESTED_NEXT_PAGE", payload: true });
					queueMicrotask(() => handleLoadMore());
				}
			}
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[pagination, status, hasRequestedNextPage, invisibleItemsThreshold],
	);

	// -------------------
	// BUILDER: render item with pagination logic
	// -------------------
	const renderPagedItem = useCallback(
		(index: number): React.ReactNode => (
			<PagedItem<T>
				index={index}
				pagination={pagination}
				status={status}
				itemKey={itemKey}
				renderItem={renderItem}
				renderSeparator={renderSeparator}
				renderLoadingMore={renderLoadingMore}
				renderSubsequentPageError={renderSubsequentPageError}
				renderEnd={renderEnd}
				onLoadMore={handleLoadMore}
				invisibleItemsThreshold={invisibleItemsThreshold}
			/>
		),
		[
			pagination,
			status,
			itemKey,
			renderItem,
			renderSeparator,
			renderLoadingMore,
			renderSubsequentPageError,
			renderEnd,
			handleLoadMore,
			invisibleItemsThreshold,
		],
	);

	// -------------------
	// BUILDER: render item only, no status
	// -------------------
	const renderItemWithoutStatus = useCallback(
		(index: number): React.ReactNode => {
			const itemData = pagination.list[index];
			return (
				<PagedItemWithoutStatus
					index={index}
					pagination={pagination}
					status={status}
					invisibleItemsThreshold={invisibleItemsThreshold}
					onLoadMore={handleLoadMore}
				>
					{renderItem({
						index,
						data: itemData,
						key: itemKey(itemData),
					})}
				</PagedItemWithoutStatus>
			);
		},
		[pagination, renderItem, itemKey, status, invisibleItemsThreshold, handleLoadMore],
	);

	const renderPagedStatus = useCallback(
		(index: number): React.ReactNode => {
			const isLastItem = index === pagination.list.length - 1;
			const itemData = pagination.list[index];
			return (
				<React.Fragment>
					{renderSeparator?.({ index, data: itemData })}
					{isLastItem &&
						(() => {
							switch (status) {
								case PaginationStatus.LOADING_MORE:
									return renderLoadingMore?.();
								case PaginationStatus.SUBSEQUENT_PAGE_ERROR:
									return renderSubsequentPageError?.({
										error: pagination.error ?? null,
										onRetry: handleLoadMore,
									});
								case PaginationStatus.COMPLETED:
									return renderEnd?.();
								default:
									return null;
							}
						})()}
				</React.Fragment>
			);
		},
		[
			pagination.list,
			pagination.error,
			status,
			renderSeparator,
			renderLoadingMore,
			renderSubsequentPageError,
			renderEnd,
			handleLoadMore,
		],
	);

	return {
		pagination,
		status,
		handleInitial,
		handleRefresh,
		handleLoadMore,
		renderPagedItem,
		renderPagedStatus,
		updatePagination,
		updateStatus,
		checkLoadMore,
		renderItemWithoutStatus,
	};
}

type PagedItemProps<T> = {
	index: number;
	pagination: Pagination<T>;
	status: PaginationStatus;
	itemKey: ItemKeyFn<T>;
	renderItem: RenderItemFn<T>;
	renderSeparator?: RenderSeparatorFn<T>;
	renderLoadingMore?: RenderLoadingMoreFn;
	renderSubsequentPageError?: RenderSubsequentPageErrorFn;
	renderEnd?: RenderEndFn;
	onLoadMore: () => void;
	invisibleItemsThreshold: number;
};

export function PagedItem<T>({
	index,
	pagination,
	status,
	itemKey,
	renderItem,
	renderSeparator,
	renderLoadingMore,
	renderSubsequentPageError,
	renderEnd,
	onLoadMore,
	invisibleItemsThreshold,
}: PagedItemProps<T>) {
	const itemData = pagination.list[index];
	const isLastItem = index === pagination.list.length - 1;

	useEffect(() => {
		if (status !== PaginationStatus.ONGOING) return;

		const triggerIndex = Math.max(0, pagination.list.length - invisibleItemsThreshold);
		if (!isLastPage(pagination) && index === triggerIndex) {
			onLoadMore();
		}
	}, [index, pagination, status, invisibleItemsThreshold, onLoadMore]);

	let content = renderItem({
		index,
		data: itemData,
		key: itemKey(itemData),
	});

	if (isLastItem) {
		const statusNode = (() => {
			switch (status) {
				case PaginationStatus.LOADING_MORE:
					return (
						<>
							{renderSeparator?.({ index, data: itemData })}
							{renderLoadingMore?.()}
						</>
					);
				case PaginationStatus.SUBSEQUENT_PAGE_ERROR:
					return renderSubsequentPageError?.({
						error: pagination.error ?? null,
						onRetry: onLoadMore,
					});
				case PaginationStatus.COMPLETED:
					return renderEnd?.();
				default:
					return null;
			}
		})();

		content = (
			<>
				{content}
				{statusNode}
			</>
		);
	}

	return <div key={itemKey(itemData)}>{content}</div>;
}

function PagedItemWithoutStatus<T>({
	index,
	pagination,
	status,
	invisibleItemsThreshold,
	onLoadMore,
	children,
}: {
	index: number;
	pagination: Pagination<T>;
	status: PaginationStatus;
	invisibleItemsThreshold: number;
	onLoadMore: () => void;
	children: React.ReactNode;
}) {
	React.useEffect(() => {
		if (status !== PaginationStatus.ONGOING) return;
		const triggerIndex = Math.max(0, pagination.list.length - invisibleItemsThreshold);
		if (!isLastPage(pagination) && index === triggerIndex) {
			onLoadMore();
		}
	}, [index, pagination, status, invisibleItemsThreshold, onLoadMore]);
	return <>{children}</>;
}
