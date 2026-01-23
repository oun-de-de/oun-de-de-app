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
		// eslint-disable-next-line
	}, []);

	// useUpdateEffect(() => {
	//     if (initialPagination) {
	//         updatePagination(initialPagination);
	//     }
	// }, [initialPagination]);

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
	// BUILDER: render item theo trạng thái (giống paged_widget.dart)
	// -------------------
	const renderPagedItem = useCallback(
		(index: number): React.ReactNode => {
			// Check if should load more before rendering
			checkLoadMore(index);

			const itemData = pagination.list[index];
			const isLastItem = index === pagination.list.length - 1;

			// Render the main item
			let item = renderItem({
				index,
				data: itemData,
				key: itemKey(itemData),
			});

			// If it's the last item, append loading/error/end states
			if (isLastItem) {
				const statusElement = (() => {
					switch (status) {
						case PaginationStatus.LOADING_MORE:
							return (
								<React.Fragment>
									{renderSeparator?.({ index, data: itemData })}
									{renderLoadingMore?.()}
								</React.Fragment>
							);
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
				})();

				item = (
					<React.Fragment>
						{item}
						{statusElement}
					</React.Fragment>
				);
			}

			return <div key={itemKey(itemData)}>{item}</div>;
		},
		[
			pagination,
			status,
			itemKey,
			renderItem,
			renderSeparator,
			renderLoadingMore,
			renderSubsequentPageError,
			renderEnd,
			checkLoadMore,
			handleLoadMore,
		],
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
	};
}
