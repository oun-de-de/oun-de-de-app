import { SaleCategory } from "@/core/domain/sales/entities/sale-category";
import { SaleFilters } from "@/core/domain/sales/entities/sale-filter";
import { SaleProduct } from "@/core/domain/sales/entities/sale-product";
import { BaseStore } from "@/core/interfaces/base-store";
import { copyWithPagination, Pagination } from "@/core/types/pagination";
import {
	SaleProductFilterErrorState,
	SaleProductFilterLoadingState,
	SaleProductFilterSuccessState,
	SaleProductInitialState,
	SaleProductLoadFirstListErrorState,
	SaleProductLoadFirstListSuccessState,
	SaleProductLoadFirstLoadingState,
	SaleProductLoadMoreListErrorState,
	SaleProductLoadMoreListSuccessState,
	SaleProductLoadMoreLoadingState,
	SaleProductReloadListErrorState,
	SaleProductReloadListLoadingState,
	SaleProductReloadListSuccessState,
	SaleProductSearchErrorState,
	SaleProductSearchLoadingState,
	SaleProductSearchSuccessState,
	SaleProductSelectCategoriesErrorState,
	SaleProductSelectCategoriesLoadingState,
	SaleProductSelectCategoriesSuccessState,
	SaleProductState,
} from "./sale-product-state";
import { createBoundStore } from "@/core/utils/create-bound-store";
import { create } from "zustand";
import {
	SaleProductRepository,
	SaleProductRepositoryImpl,
} from "@/core/domain/sales/repositories/sale-product-repository";
import Repository from "@/service-locator";
import { GetSaleProductListUseCase } from "@/core/domain/sales/usecases/get-list-sale-product-use-case";

type SaleProductActions = {
	loadFirstPage: () => Promise<Pagination<SaleProduct>>;
	loadMorePage: (page: number) => Promise<Pagination<SaleProduct>>;
	reloadPage: () => Promise<Pagination<SaleProduct>>;
	searchProducts: (query: string) => Promise<void>;
	filterProducts: (filters: SaleFilters) => Promise<void>;
	selectCategories: (categories: SaleCategory[]) => Promise<void>;
};

export interface SaleProductStore extends BaseStore<SaleProductState, SaleProductActions> {
	state: SaleProductState;
	actions: {
		loadFirstPage: () => Promise<Pagination<SaleProduct>>;
		loadMorePage: (page: number) => Promise<Pagination<SaleProduct>>;
		reloadPage: () => Promise<Pagination<SaleProduct>>;
		searchProducts: (query: string) => Promise<void>;
		filterProducts: (filters: SaleFilters) => Promise<void>;
		selectCategories: (categories: SaleCategory[]) => Promise<void>;
	};
}

type SaleProductsStoreProps = {
	variant: string;
	saleProductRepo: SaleProductRepository;
};

const createSaleProductsStore = ({ variant, saleProductRepo }: SaleProductsStoreProps) => {
	// ponytail: single global request counter, not per-action. Good enough to drop stale
	// out-of-order responses; upgrade to AbortController per-action if cancellation is needed.
	let requestId = 0;
	const nextRequest = () => ++requestId;
	const isStale = (id: number) => id !== requestId;

	return create<SaleProductStore>((set, get) => ({
		state: SaleProductInitialState({ variant }),
		actions: {
			async loadFirstPage() {
				const id = nextRequest();
				set({ state: SaleProductLoadFirstLoadingState(get().state) });
				const result = await new GetSaleProductListUseCase(saleProductRepo).getSaleProductList({
					filters: get().state.filters,
					search: get().state.search,
					categoryIds: get().state.selectedCategories.map((cat) => cat.id),
				});
				if (isStale(id)) return get().state.pagination;

				return result.fold(
					(failure) => {
						set({
							state: SaleProductLoadFirstListErrorState(get().state, failure),
						});
						return copyWithPagination(get().state.pagination, { error: failure.message });
					},
					(pagination) => {
						set({
							state: SaleProductLoadFirstListSuccessState(get().state, pagination),
						});
						return pagination;
					},
				);
			},
			async loadMorePage(_page: number) {
				const id = nextRequest();
				set({
					state: SaleProductLoadMoreLoadingState(get().state),
				});
				const result = await new GetSaleProductListUseCase(saleProductRepo).getSaleProductList({
					pagination: get().state.pagination,
					filters: get().state.filters,
					search: get().state.search,
					categoryIds: get().state.selectedCategories.map((cat) => cat.id),
				});
				if (isStale(id)) return get().state.pagination;

				return result.fold(
					(failure) => {
						set({
							state: SaleProductLoadMoreListErrorState(get().state, failure),
						});
						return copyWithPagination(get().state.pagination, { error: failure.message });
					},
					(pagination) => {
						set({
							state: SaleProductLoadMoreListSuccessState(get().state, pagination),
						});
						return pagination;
					},
				);
			},
			async reloadPage() {
				const id = nextRequest();
				set({
					state: SaleProductReloadListLoadingState(get().state),
				});
				const result = await new GetSaleProductListUseCase(saleProductRepo).getSaleProductList({
					filters: get().state.filters,
					search: get().state.search,
					categoryIds: get().state.selectedCategories.map((cat) => cat.id),
				});
				if (isStale(id)) return get().state.pagination;

				return result.fold(
					(failure) => {
						set({
							state: SaleProductReloadListErrorState(get().state, failure),
						});
						return copyWithPagination(get().state.pagination, { error: failure.message });
					},
					(pagination) => {
						set({
							state: SaleProductReloadListSuccessState(get().state, pagination),
						});
						return pagination;
					},
				);
			},
			async searchProducts(search: string) {
				const id = nextRequest();
				set({
					state: SaleProductSearchLoadingState(get().state, search),
				});
				const result = await new GetSaleProductListUseCase(saleProductRepo).getSaleProductList({
					filters: get().state.filters,
					search,
					categoryIds: get().state.selectedCategories.map((cat) => cat.id),
				});
				if (isStale(id)) return;

				result.fold(
					(failure) => {
						set({
							state: SaleProductSearchErrorState(get().state, failure),
						});
					},
					(pagination) => {
						set({
							state: SaleProductSearchSuccessState(get().state, pagination),
						});
					},
				);
			},
			async filterProducts(filters: SaleFilters) {
				const id = nextRequest();
				set({
					state: SaleProductFilterLoadingState(get().state, filters),
				});
				const result = await new GetSaleProductListUseCase(saleProductRepo).getSaleProductList({
					filters,
					search: get().state.search,
					categoryIds: get().state.selectedCategories.map((cat) => cat.id),
				});
				if (isStale(id)) return;

				result.fold(
					(failure) => {
						set({
							state: SaleProductFilterErrorState(get().state, failure),
						});
					},
					(pagination) => {
						set({
							state: SaleProductFilterSuccessState(get().state, pagination),
						});
					},
				);
			},
			async selectCategories(categories: SaleCategory[]) {
				const id = nextRequest();
				set({
					state: SaleProductSelectCategoriesLoadingState(get().state, categories),
				});
				const result = await new GetSaleProductListUseCase(saleProductRepo).getSaleProductList({
					filters: get().state.filters,
					search: get().state.search,
					categoryIds: categories.map((cat) => cat.id),
				});
				if (isStale(id)) return;

				result.fold(
					(failure) => {
						set({
							state: SaleProductSelectCategoriesErrorState(get().state, failure),
						});
					},
					(pagination) => {
						set({
							state: SaleProductSelectCategoriesSuccessState(get().state, pagination),
						});
					},
				);
			},
		},
	}));
};

export const saleProductsBoundStore = (variant: string) =>
	createBoundStore<SaleProductStore>({
		createStore: () =>
			createSaleProductsStore({
				variant,
				saleProductRepo: Repository.get<SaleProductRepository>(SaleProductRepositoryImpl),
			}),
	});
