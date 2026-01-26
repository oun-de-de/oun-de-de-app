import { VirtualGridLoading } from "@/core/components/common/virtual-list/virtual-grid-loading";
import { ProductLoadingCard } from "../cards/product-loading-card";

export interface SaleProductListLoadingProps {
	count?: number;
	columns?: number;
	height?: string | number;
	cardHeight?: number;
	className?: string;
	gap?: number;
}

export function SaleProductListLoading({
	count = 20,
	columns = 4,
	height = "100%",
	cardHeight = 240,
	className,
	gap = 12,
}: SaleProductListLoadingProps) {
	return (
		<VirtualGridLoading
			count={count}
			columns={columns}
			estimateRowHeight={cardHeight}
			height={height}
			className={className}
			gap={gap}
			renderItem={(_, idx) => <ProductLoadingCard key={idx} height={cardHeight} />}
		/>
	);
}
