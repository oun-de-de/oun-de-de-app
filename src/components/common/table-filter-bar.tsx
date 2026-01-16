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

const BarRoot = styled.div.attrs({
  className: 'flex flex-wrap items-center gap-2',
})``;

const SearchWrap = styled.div.attrs({
  className: 'relative flex-1 min-w-[180px]',
})``;

const SearchIconWrap = styled.span.attrs({
  className: 'absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground',
})``;

type SelectOption = {
  value: string;
  label: string;
};

type FilterBarProps = {
  typeOptions: SelectOption[];
  fieldOptions: SelectOption[];
  typeValue?: string;
  fieldValue?: string;
  searchValue?: string;
  defaultTypeValue?: string;
  defaultFieldValue?: string;
  defaultSearchValue?: string;
  typePlaceholder?: string;
  fieldPlaceholder?: string;
  searchPlaceholder?: string;
  onTypeChange?: (value: string) => void;
  onFieldChange?: (value: string) => void;
  onSearchChange?: (value: string) => void;
  onFilterClick?: () => void;
};

export function TableFilterBar({
  typeOptions,
  fieldOptions,
  typeValue,
  fieldValue,
  searchValue,
  defaultTypeValue,
  defaultFieldValue,
  defaultSearchValue,
  typePlaceholder = 'Cash Sale',
  fieldPlaceholder = 'Field name',
  searchPlaceholder = 'Search...',
  onTypeChange,
  onFieldChange,
  onSearchChange,
  onFilterClick,
}: FilterBarProps) {
  return (
    <BarRoot>
      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9"
        onClick={onFilterClick}
      >
        <Icon icon="mdi:filter-variant" />
      </Button>
      <Select
        {...(typeValue === undefined
          ? { defaultValue: defaultTypeValue }
          : { value: typeValue })}
        onValueChange={onTypeChange}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder={typePlaceholder} />
        </SelectTrigger>
        <SelectContent>
          {typeOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        {...(fieldValue === undefined
          ? { defaultValue: defaultFieldValue }
          : { value: fieldValue })}
        onValueChange={onFieldChange}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder={fieldPlaceholder} />
        </SelectTrigger>
        <SelectContent>
          {fieldOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <SearchWrap>
        <Input
          placeholder={searchPlaceholder}
          className="pl-9"
          {...(searchValue === undefined
            ? { defaultValue: defaultSearchValue }
            : { value: searchValue })}
          onChange={(event) => onSearchChange?.(event.target.value)}
        />
        <SearchIconWrap>
          <Icon icon="mdi:magnify" />
        </SearchIconWrap>
      </SearchWrap>
    </BarRoot>
  );
}
