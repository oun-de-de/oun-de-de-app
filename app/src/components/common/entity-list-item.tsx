import type { EntityListItemData } from '@/types/common';
import styled from 'styled-components';

const ItemButton = styled.button.attrs<{ $active: boolean }>(({ $active }) => ({
  className: `flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-sm transition ${
    $active
      ? 'border-primary/50 bg-primary/5'
      : 'border-transparent hover:border-border hover:bg-muted/40'
  }`,
}))``;

const NameText = styled.span.attrs({
	className: 'font-semibold text-slate-900',
})``;

const CodeText = styled.span.attrs({
  className: 'text-xs text-muted-foreground',
})``;

type EntityListItemProps = {
  customer: EntityListItemData;
  isActive: boolean;
  onSelect: (id: string) => void;
};

export function EntityListItem({
  customer,
  isActive,
  onSelect,
}: EntityListItemProps) {
  return (
    <ItemButton
      type="button"
      $active={isActive}
      onClick={() => onSelect(customer.id)}
    >
      <NameText>
        {customer.id} : {customer.name}
      </NameText>
      <CodeText>{customer.code}</CodeText>
    </ItemButton>
  );
}
