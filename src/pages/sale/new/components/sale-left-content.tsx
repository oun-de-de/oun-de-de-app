import styled from "styled-components";
import SaleLeftCollapsible from "./collapsibles/sale-left-collapsible";
import { SearchInput } from "./filters";
import ChoiceChipsPromise from "./promise/choice-chips-promise";
import { SaleProductStore } from "../stores/sale-products/sale-products-store";
import { useStore } from "@/core/ui/store/multi-store-provider";
import { SaleProduct, SaleProductList } from "./list/sale-product-list";
import { StoreConsumer } from "@/core/ui/store/store-consumer";
import { useRef } from "react";
import { PagedGridRef } from "@/core/components/pagination/paged-grid";
import { SaleProductState } from "../stores/sale-products/sale-product-state";
import { isLoadingState } from "@/core/types/state";
import { loadingOverlay } from "@/core/components/loading";

export default function SaleLeftContent() {
	const store = useStore<SaleProductStore>("saleProductsStore");
	const { useAction } = store;
	const saleProductListRef = useRef<PagedGridRef<SaleProduct>>(null);

	const { loadFirstPage, loadMorePage, reloadPage, selectCategories, searchProducts, filterProducts } = useAction();

	const listener = (state: SaleProductState) => {
		if (state.type === "SearchErrorState") {
			saleProductListRef.current?.updatePagination(state.pagination);
		} else if (state.type === "SearchSuccessState") {
			saleProductListRef.current?.updatePagination(state.pagination);
		} else if (state.type === "SearchLoadingState") {
			loadingOverlay.show();
		}

		if (state.type === "FilterErrorState") {
			saleProductListRef.current?.updatePagination(state.pagination);
		} else if (state.type === "FilterSuccessState") {
			saleProductListRef.current?.updatePagination(state.pagination);
		} else if (state.type === "FilterLoadingState") {
			loadingOverlay.show();
		}

		if (state.type === "SelectCategoriesErrorState") {
			saleProductListRef.current?.updatePagination(state.pagination);
		} else if (state.type === "SelectCategoriesSuccessState") {
			saleProductListRef.current?.updatePagination(state.pagination);
		} else if (state.type === "SelectCategoriesLoadingState") {
			loadingOverlay.show();
		}

		if (!isLoadingState(state)) {
			loadingOverlay.hide();
		}
	};

	return (
		<StoreConsumer<SaleProductStore>
			store={store}
			listener={listener}
			builder={(state) => {
				return (
					<Container className="py-3">
						<SaleLeftCollapsible formSaleFilters={state.filters} onChange={filterProducts} />
						<ChoiceChipsPromise value={state.selectedCategories} onChange={selectCategories} />
						<SearchInput onDeferredSearchChange={searchProducts} />
						<GridSection className="pl-1">
							<SaleProductList
								ref={saleProductListRef}
								pagination={state.pagination}
								height="100%"
								columns={4}
								itemHeight={210}
								onInitial={loadFirstPage}
								onRefresh={reloadPage}
								onLoadMore={loadMorePage}
								// onProductClick={state.onProductClick}
							/>
						</GridSection>
					</Container>
				);
			}}
		/>
	);
}

//#region Styled Components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
  flex: 1;
  min-height: 0;
  overflow: hidden;
`;

const GridSection = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  width: 100%;
  overflow: hidden;
`;
//#endregion
