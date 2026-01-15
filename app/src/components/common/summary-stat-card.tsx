import Icon from '@/components/icon/icon';
import { Text, Title } from '@/ui/typography';
import { fNumber } from '@/utils/format-number';
import type { SummaryStatCardData } from '@/types/common';
import styled from 'styled-components';

const CardRoot = styled.div.attrs({
	className: 'flex items-center justify-between rounded-lg border px-4 py-3',
})``;

const LabelText = styled(Text).attrs({
	variant: 'caption',
	className: 'text-muted-foreground',
})``;

const ValueTitle = styled(Title).attrs({
	as: 'h6',
	className: 'text-lg font-bold',
})``;

const IconWrap = styled.span.attrs<{ $color: string }>(({ $color }) => ({
	className: `flex h-10 w-10 items-center justify-center rounded-lg text-white ${$color}`,
}))``;

export function SummaryStatCard({
  label,
  value,
  color,
  icon,
}: SummaryStatCardData) {
  return (
    <CardRoot>
      <div>
        <LabelText>{label}</LabelText>
        <ValueTitle>{fNumber(value)} KHR</ValueTitle>
      </div>
      <IconWrap $color={color}>
        <Icon icon={icon} size={20} />
      </IconWrap>
    </CardRoot>
  );
}
