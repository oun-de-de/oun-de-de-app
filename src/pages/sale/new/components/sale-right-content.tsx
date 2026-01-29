import { styled } from "styled-components";
import { RefNoInput } from "./inputs/ref-no-input";
import { CartTable } from "./table/cart-table";
import { CartActions } from "./actions/cart-actions";
import Repository from "@/service-locator";
import { SaleCartRepository, SaleCartRepositoryImpl } from "@/core/domain/sales/repositories/sale-cart-repository";
import { useObservable } from "@/core/theme/hooks/use-observable";

export default function SaleRightContent() {
	const cartRepo = Repository.get<SaleCartRepository>(SaleCartRepositoryImpl);
	const itemsStream = useObservable(cartRepo.itemsStream$, cartRepo.items());

	return (
		<Container>
			<RefNoInput />
			<CartTable data={itemsStream} />
			<Separator />
			<CartActions />
		</Container>
	);
}

//#region Styled Components
const Container = styled.div.attrs({ className: "pt-3 pb-1" })`
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
  flex: 1;
  min-height: 0;
  overflow: hidden;
`;

const Separator = styled.div.attrs({ className: "px-1" })`
	height: 2px;
	background: ${({ theme }) => theme.colors.palette.gray[300]};
	border-radius: 4px;
	width: 100%;
`;

//#endregion
