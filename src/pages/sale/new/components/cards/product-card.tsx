import { SaleProduct } from "@/core/domain/sales/entities/sale-product";
import styled from "styled-components";
interface ProductCardProps {
	item: SaleProduct;
	height?: number;
	onClick?: (item: SaleProduct) => void;
}

function formatPrice(value: number, currency?: string) {
	const suffix = currency ?? "៛";
	return `${value.toLocaleString()} ${suffix}`;
}

export function ProductCard({ item, height = 240, onClick }: ProductCardProps) {
	return (
		<Card style={{ height }} onClick={() => onClick?.(item)}>
			<PriceTag>{formatPrice(item.price, item.currency)}</PriceTag>
			<ImagePlaceholder>
				{item.imageUrl ? (
					<img src={item.imageUrl} alt={item.name} style={{ maxHeight: "100%", maxWidth: "100%" }} />
				) : (
					"No image available"
				)}
			</ImagePlaceholder>
			<Name>{item.name}</Name>
		</Card>
	);
}

//#region Styled Components
const Card = styled.div`
  position: relative;
  border: 1px solid ${({ theme }) => theme.colors.palette.gray[200]};
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.common.white};
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  padding: 12px;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:active {
    transform: scale(0.98);
  }
`;

const PriceTag = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  background: ${({ theme }) => theme.colors.palette.gray[900]};
  color: ${({ theme }) => theme.colors.common.white};
  border-radius: 10px;
  padding: 4px 8px;
  font-size: 13px;
  font-weight: 700;
`;

const ImagePlaceholder = styled.div`
  flex: 1;
  min-height: 120px;
  border: 1px dashed ${({ theme }) => theme.colors.palette.gray[300]};
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.palette.gray[400]};
  background: ${({ theme }) => theme.colors.background.neutral[50]};
`;

const Name = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.palette.gray[800]};
`;
//#endregion
