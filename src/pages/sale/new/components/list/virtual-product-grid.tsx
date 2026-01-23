import { useMemo, type CSSProperties } from "react";
import styled from "styled-components";
import { VirtualList } from "@/core/components/common/virtual-list";
import { ProductCard, type ProductCardData } from "../cards/product-card";

export type VirtualProduct = ProductCardData;

interface RowItemProps {
	rowItems: VirtualProduct[];
	columns: number;
	cardHeight: number;
	style: CSSProperties;
	onProductClick?: (product: VirtualProduct) => void;
}

interface VirtualProductGridProps {
	items: VirtualProduct[];
	/** number of columns to display; keep consistent height for best perf */
	columns?: number;
	/** height of each card (px) */
	cardHeight?: number;
	/** height of the scroll area (px or CSS length, e.g., "100%" for full height) */
	height?: number | string;
	className?: string;
	/** callback when a product card is clicked */
	onProductClick?: (product: VirtualProduct) => void;
}

export function VirtualProductGrid({
	items,
	columns = 4,
	cardHeight = 240,
	height = "100%",
	className,
	onProductClick,
}: VirtualProductGridProps) {
	const rows = useMemo(() => {
		const result: VirtualProduct[][] = [];
		for (let i = 0; i < items.length; i += columns) {
			result.push(items.slice(i, i + columns));
		}
		return result;
	}, [items, columns]);

	const rowHeight = cardHeight + 18;

	return (
		<GridContainer $height={height ?? "100%"} className={className}>
			<VirtualList
				data={rows}
				height="100%"
				estimateSize={rowHeight}
				overscan={1}
				renderItem={(rowItems, style, index) => (
					<RowItem
						key={rowItems[0]?.id ?? index}
						rowItems={rowItems}
						columns={columns}
						cardHeight={cardHeight}
						style={style}
						onProductClick={onProductClick}
					/>
				)}
			/>
		</GridContainer>
	);
}

function RowItem({ rowItems, columns, cardHeight, style, onProductClick }: RowItemProps) {
	return (
		<Row $columns={columns} style={style}>
			{rowItems.map((item) => (
				<ProductCard key={item.id} item={item} height={cardHeight} onClick={onProductClick} />
			))}
		</Row>
	);
}

//#region Styled Components
const GridContainer = styled.div<{ $height: number | string }>`
  height: ${({ $height }) => (typeof $height === "number" ? `${$height}px` : $height)};
  width: 100%;
  flex: 1;
  min-height: 0;
`;

const Row = styled.div<{ $columns: number }>`
  display: grid;
  grid-template-columns: repeat(${({ $columns }) => $columns}, minmax(0, 1fr));
  gap: 12px;
  padding: 6px 0;
`;
//#endregion
