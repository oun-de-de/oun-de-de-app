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
import {
  EntityListItem,
  TableFilterBar,
  TablePagination,
  SummaryStatCard,
} from '@/components/common';
import {
  useProductsList,
  useProductsListActions,
} from '@/store/productsListStore';
import { useState } from 'react';
import {
  productList,
  productRows,
  productSummaryCards,
} from '@/_mock/data/dashboard';

const summaryCards = productSummaryCards;

const filterTypeOptions = [
  { value: 'all', label: 'All' },
  { value: 'cash-sale', label: 'Cash Sale' },
  { value: 'invoice', label: 'Invoice' },
  { value: 'receipt', label: 'Receipt' },
];

const filterFieldOptions = [
  { value: 'field-name', label: 'Field name' },
  { value: 'ref-no', label: 'Ref No' },
];

const paginationPages: Array<number | '...'> = [1, 2, 3, 4, '...', 19];

const rows = productRows;

export default function ProductsPage() {
  const [activeProductId, setActiveProductId] = useState<string | null>(null);
  const activeProduct = productList.find((item) => item.id === activeProductId);
  const listState = useProductsList();
  const { updateState } = useProductsListActions();

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[320px_1fr]">
        <Card className="h-full">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Select defaultValue="type">
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Item Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="type">Item Type</SelectItem>
                  <SelectItem value="inventory">Inventory</SelectItem>
                  <SelectItem value="service">Service</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" className="h-9 w-9">
                <Icon icon="mdi:menu" />
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
              {productList.map((item) => (
                <EntityListItem
                  key={item.id}
                  customer={item}
                  isActive={item.id === activeProductId}
                  onSelect={setActiveProductId}
                />
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
              <span>Total 10</span>
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
                  <Icon icon="mdi:package-variant" />
                  Inventory
                </Button>
                <Text variant="body2" className="text-muted-foreground">
                  {activeProduct
                    ? `${activeProduct.name} selected`
                    : 'No item selected'}
                </Text>
              </div>
              <Button size="sm" className="gap-2">
                <Icon icon="mdi:plus" />
                Create Sale
                <Icon icon="mdi:chevron-down" />
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
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
              typePlaceholder="Cash Sale"
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

            <div className="overflow-x-auto rounded-lg border">
              <table className="min-w-full text-sm">
                <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 text-left">Date</th>
                    <th className="px-3 py-2 text-left">Ref No</th>
                    <th className="px-3 py-2 text-left">Type</th>
                    <th className="px-3 py-2 text-left">Status</th>
                    <th className="px-3 py-2 text-right">Qty</th>
                    <th className="px-3 py-2 text-right">Cost</th>
                    <th className="px-3 py-2 text-right">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {rows.map((row) => (
                    <tr key={row.refNo} className="hover:bg-muted/30">
                      <td className="px-3 py-2 text-muted-foreground">
                        {row.date}
                      </td>
                      <td className="px-3 py-2 text-sky-600">{row.refNo}</td>
                      <td className="px-3 py-2">
                        <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs text-sky-700">
                          {row.type}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <span className="rounded-md bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
                          {row.status}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right">{row.qty}</td>
                      <td className="px-3 py-2 text-right">
                        {row.cost.toLocaleString()}
                      </td>
                      <td className="px-3 py-2 text-right font-semibold">
                        {row.price.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <TablePagination
              pages={paginationPages}
              currentPage={listState.page}
              totalItems={378}
              pageSize={listState.pageSize}
              pageSizeOptions={[10, 20, 50]}
              goToValue={String(listState.page)}
              onPrev={() =>
                updateState({ page: Math.max(1, listState.page - 1) })
              }
              onNext={() =>
                updateState({
                  page: Math.min(19, listState.page + 1),
                })
              }
              onPageChange={(nextPage) =>
                updateState({ page: nextPage })
              }
              onPageSizeChange={(nextSize) =>
                updateState({ pageSize: nextSize, page: 1 })
              }
              onGoToChange={(value) =>
                updateState({ page: Number(value) || 1 })
              }
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
