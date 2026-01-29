import { forwardRef } from "react";
import styled from "styled-components";
import { ProductCard } from "../cards/product-card";
import { UsePaginationOptions } from "@/core/hooks/use-pagination";
import { PagedGrid, PagedGridRef } from "@/core/components/pagination/paged-grid";
import SaleProductListEmpty from "./sale-product-list-empty";
import { SaleProductListLoading } from "./sale-product-list-loading";
import { Spinner } from "@/core/components/common/spinner";
import { SaleProduct } from "@/core/domain/sales/entities/sale-product";

interface SaleProductListProps {
	pagination?: UsePaginationOptions<SaleProduct>["initialPagination"];
	columns?: number;
	gap?: number;
	itemHeight?: number;
	height?: string | number;

	onInitial: UsePaginationOptions<SaleProduct>["onInitial"];
	onRefresh: UsePaginationOptions<SaleProduct>["onRefresh"];
	onLoadMore: UsePaginationOptions<SaleProduct>["onLoadMore"];

	onProductClick?: (product: SaleProduct) => void;
}

export const SaleProductList = forwardRef<PagedGridRef<SaleProduct>, SaleProductListProps>(function SaleProductList(
	{
		pagination,
		columns = 4,
		gap = 2,
		itemHeight = 240,
		height = "100%",
		onInitial,
		onRefresh,
		onLoadMore,
		onProductClick,
	},
	ref,
) {
	return (
		<Container>
			<PagedGrid<SaleProduct>
				ref={ref}
				itemKey={(item) => item.id.toString()}
				pagination={pagination}
				columns={columns}
				gap={gap}
				itemHeight={itemHeight}
				height={height}
				onInitial={onInitial}
				onRefresh={onRefresh}
				onLoadMore={onLoadMore}
				itemBuilder={(_index, item) => (
					<ProductCard key={item.id} item={item} height={itemHeight} onClick={() => onProductClick?.(item)} />
				)}
				emptyBuilder={() => <SaleProductListEmpty />}
				loadingFirstPageBuilder={() => <SaleProductListLoading columns={columns} />}
				loadingMoreBuilder={() => <Spinner className="my-4" size={18} />}
			/>
		</Container>
	);
});

//#region Styled Components
const Container = styled.div`
  width: 100%;
  height: 100%;
  min-height: 0;
`;

//#endregion
