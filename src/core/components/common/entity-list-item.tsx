import type { EntityListItemData } from "@/core/types/common";
import { Button } from "@/core/ui/button";
import styled from "styled-components";

const ItemButton = styled(Button).attrs<{ $active: boolean }>(({ $active }) => ({
	className: `flex w-full items-center justify-between text-left transition
		${$active && "bg-blue-400 hover:bg-blue-500 text-white"}
	`,
}))``;

const NameText = styled.span.attrs<{ $active: boolean }>(({ $active }) => ({
	className: `font-semibold ${$active ? "text-white" : "text-black"}`,
}))``;

const CodeText = styled.span.attrs<{ $active: boolean }>(({ $active }) => ({
	className: `text-xs ${$active ? "text-white" : "text-slate-400"}`,
}))``;

type EntityListItemProps = {
	customer: EntityListItemData;
	isActive: boolean;
	onSelect: (id: string) => void;
};

export function EntityListItem({ customer, isActive, onSelect }: EntityListItemProps) {
	return (
		<ItemButton variant="ghost" $active={isActive} onClick={() => onSelect(customer.id)}>
			<NameText $active={isActive}>
				{customer.id} : {customer.name}
			</NameText>
			<CodeText $active={isActive}>{customer.code}</CodeText>
		</ItemButton>
	);
}
