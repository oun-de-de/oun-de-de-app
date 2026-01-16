import Icon from '@/components/icon/icon';
import { Button } from '@/core/ui/button';
import { Input } from '@/core/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/core/ui/select';
import styled from 'styled-components';

const PaginationRoot = styled.div.attrs({
  className:
    'flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground',
})``;

const NavWrap = styled.div.attrs({
  className: 'flex items-center gap-2',
})``;

const PageButtons = styled.div.attrs({
  className: 'flex items-center gap-1',
})``;

const GoToWrap = styled.div.attrs({
  className: 'flex items-center gap-2',
})``;

const GoToInputWrap = styled.div.attrs({
  className: 'w-[56px]',
})``;

type PaginationProps = {
  pages: Array<number | '...'>;
  currentPage: number;
  totalItems: number;
  pageSize: number;
  pageSizeOptions: number[];
  goToValue?: string;
  goToLabel?: string;
  totalLabel?: string;
  onPrev?: () => void;
  onNext?: () => void;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  onGoToChange?: (value: string) => void;
};

export function TablePagination({
  pages,
  currentPage,
  totalItems,
  pageSize,
  pageSizeOptions,
  goToValue,
  goToLabel = 'Go to',
  totalLabel = 'Total',
  onPrev,
  onNext,
  onPageChange,
  onPageSizeChange,
  onGoToChange,
}: PaginationProps) {
  return (
    <PaginationRoot>
      <NavWrap>
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={onPrev}
        >
          <Icon icon="mdi:chevron-left" />
        </Button>
        <PageButtons>
          {pages.map((page, index) =>
            page === '...' ? (
              <span key={`gap-${index}`} className="px-1">
                ...
              </span>
            ) : (
              <Button
                key={page}
                size="icon"
                className="h-7 w-7"
                variant={page === currentPage ? 'default' : 'ghost'}
                onClick={() => onPageChange?.(page)}
              >
                {page}
              </Button>
            )
          )}
        </PageButtons>
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={onNext}
        >
          <Icon icon="mdi:chevron-right" />
        </Button>
      </NavWrap>
      <GoToWrap>
        <span>{goToLabel}</span>
        <GoToInputWrap>
          <Input
            className="h-7 px-2 text-xs"
            value={goToValue ?? String(currentPage)}
            onChange={(event) => onGoToChange?.(event.target.value)}
          />
        </GoToInputWrap>
        <Select
          value={String(pageSize)}
          onValueChange={(value) => onPageSizeChange?.(Number(value))}
        >
          <SelectTrigger className="h-7 w-[92px] text-xs">
            <SelectValue placeholder={`${pageSize}`} />
          </SelectTrigger>
          <SelectContent>
            {pageSizeOptions.map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span>
          {totalLabel} {totalItems}
        </span>
      </GoToWrap>
    </PaginationRoot>
  );
}
