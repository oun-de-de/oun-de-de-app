import Icon from '@/components/icon/icon';
import { Button } from '@/ui/button';
import { Card, CardContent } from '@/ui/card';
import { Input } from '@/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/select';
import { Text } from '@/ui/typography';
import { useEffect, useMemo, useState } from 'react';
import {
  EntityListItem,
  SimpleDataTable,
  TableFilterBar,
  TablePagination,
  SummaryStatCard,
} from '@/components/common';
import {
  useCustomersList,
  useCustomersListActions,
} from '@/store/customersListStore';
import {
  customerList,
  customerSummaryCards,
  customerTransactions,
} from '@/_mock/data/dashboard';

const summaryCards = customerSummaryCards;
const transactions = customerTransactions;

const filterTypeOptions = [
  { value: 'all', label: 'All' },
  { value: 'cash-sale', label: 'Cash Sale' },
  { value: 'invoice', label: 'Invoice' },
  { value: 'receipt', label: 'Receipt' },
];

const filterFieldOptions = [
  { value: 'field-name', label: 'Field name' },
  { value: 'customer', label: 'Customer' },
  { value: 'ref-no', label: 'Ref No' },
];

const normalizeToken = (value: string) =>
  value.trim().toLowerCase().replace(/\s+/g, '-');

const buildPages = (current: number, total: number): Array<number | '...'> => {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  const pages: Array<number | '...'> = [1];
  const left = Math.max(2, current - 1);
  const right = Math.min(total - 1, current + 1);

  if (left > 2) {
    pages.push('...');
  }

  for (let page = left; page <= right; page += 1) {
    pages.push(page);
  }

  if (right < total - 1) {
    pages.push('...');
  }

  pages.push(total);
  return pages;
};

export default function CustomersPage() {
  const [activeCustomerId, setActiveCustomerId] = useState<string | null>(null);
  const listState = useCustomersList();
  const { updateState } = useCustomersListActions();
  const activeCustomer = customerList.find(
    (customer) => customer.id === activeCustomerId
  );

  const filteredTransactions = useMemo(() => {
    const normalizedType = normalizeToken(listState.typeFilter);
    const normalizedQuery = listState.searchValue.trim().toLowerCase();

    return transactions.filter((row) => {
      if (normalizedType && normalizedType !== 'all') {
        const rowType = normalizeToken(row.type);
        if (rowType !== normalizedType) {
          return false;
        }
      }

      if (!normalizedQuery) {
        return true;
      }

      if (listState.fieldFilter === 'customer') {
        return row.customer.toLowerCase().includes(normalizedQuery);
      }

      if (listState.fieldFilter === 'ref-no') {
        return row.refNo.toLowerCase().includes(normalizedQuery);
      }

      return (
        row.customer.toLowerCase().includes(normalizedQuery) ||
        row.refNo.toLowerCase().includes(normalizedQuery) ||
        row.type.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [listState.fieldFilter, listState.searchValue, listState.typeFilter]);

  const totalItems = filteredTransactions.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / listState.pageSize));
  const currentPage = Math.min(listState.page, totalPages);
  const pagedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * listState.pageSize;
    return filteredTransactions.slice(
      startIndex,
      startIndex + listState.pageSize
    );
  }, [currentPage, filteredTransactions, listState.pageSize]);

  const paginationItems = buildPages(currentPage, totalPages);

  useEffect(() => {
    if (listState.page > totalPages) {
      updateState({ page: totalPages });
    }
  }, [listState.page, totalPages, updateState]);

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
        <Card className="h-full">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Select defaultValue="type">
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Customer Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="type">Customer Type</SelectItem>
                  <SelectItem value="vip">VIP</SelectItem>
                  <SelectItem value="retail">Retail</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" className="h-9 w-9">
                <Icon icon="mdi:menu" color="white" />
              </Button>
            </div>

            <div className="mt-3 flex gap-2">
              <Input placeholder="Search..." />
              <Select defaultValue="active">
                <SelectTrigger className="w-[110px]">
                  <SelectValue placeholder="Active" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="mt-4 space-y-2">
              {customerList.map((customer) => (
                <EntityListItem
                  key={customer.id}
                  customer={customer}
                  isActive={customer.id === activeCustomerId}
                  onSelect={setActiveCustomerId}
                />
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
              <span>Total 200</span>
              <span className="flex items-center gap-1">
                <Icon icon="mdi:chevron-left" />
                <Icon icon="mdi:chevron-right" />
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-4 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Button size="sm" className="gap-1">
                  <Icon icon="mdi:account-multiple-outline" />
                  Customer
                </Button>
                <Text variant="body2" className="text-muted-foreground">
                  {activeCustomer
                    ? `${activeCustomer.name} selected`
                    : 'No Customer Selected'}
                </Text>
              </div>
              <Button size="sm" className="gap-2">
                <Icon icon="mdi:plus" />
                Create Invoice
                <Icon icon="mdi:chevron-down" />
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
              {summaryCards.map((card) => (
                <SummaryStatCard key={card.label} {...card} />
              ))}
            </div>

            <TableFilterBar
              typeOptions={filterTypeOptions}
              fieldOptions={filterFieldOptions}
              typeValue={listState.typeFilter}
              fieldValue={listState.fieldFilter}
              searchValue={listState.searchValue}
              onTypeChange={(value) =>
                updateState({ typeFilter: value, page: 1 })
              }
              onFieldChange={(value) =>
                updateState({ fieldFilter: value, page: 1 })
              }
              onSearchChange={(value) =>
                updateState({ searchValue: value, page: 1 })
              }
            />

            <SimpleDataTable rows={pagedTransactions} />

            <TablePagination
              pages={paginationItems}
              currentPage={currentPage}
              totalItems={totalItems}
              pageSize={listState.pageSize}
              pageSizeOptions={[10, 20, 50]}
              goToValue={String(listState.page)}
              onPrev={() => updateState({ page: Math.max(1, currentPage - 1) })}
              onNext={() =>
                updateState({
                  page: Math.min(totalPages, currentPage + 1),
                })
              }
              onPageChange={(nextPage) => updateState({ page: nextPage })}
              onPageSizeChange={(nextSize) =>
                updateState({ pageSize: nextSize, page: 1 })
              }
              onGoToChange={(value) => {
                const parsed = Number(value);
                if (!Number.isNaN(parsed)) {
                  updateState({
                    page: Math.min(Math.max(parsed, 1), totalPages),
                  });
                }
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
