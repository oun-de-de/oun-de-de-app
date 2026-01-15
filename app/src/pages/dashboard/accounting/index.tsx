import { EntityListItem, TablePagination } from '@/components/common';
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
	useAccountingList,
	useAccountingListActions,
} from '@/store/accountingListStore';
import { useState } from 'react';
import {
	accountingAccountList,
	accountingRows,
} from '@/_mock/data/dashboard';

const accountList = accountingAccountList;
const rows = accountingRows;

export default function AccountingPage() {
  const [activeAccountId, setActiveAccountId] = useState<string | null>(null);
  const activeAccount = accountList.find(
    (account) => account.id === activeAccountId
  );
  const listState = useAccountingList();
  const { updateState } = useAccountingListActions();

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[320px_1fr]">
        <Card className="h-full">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Select defaultValue="type">
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Account type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="type">Account type</SelectItem>
                  <SelectItem value="asset">Asset</SelectItem>
                  <SelectItem value="liability">Liability</SelectItem>
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
              {accountList.map((account) => (
                <EntityListItem
                  key={account.id}
                  customer={account}
                  isActive={account.id === activeAccountId}
                  onSelect={setActiveAccountId}
                />
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
              <span>Total 382</span>
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
                  <Icon icon="mdi:bank" />
                  Chart of Account
                </Button>
                <Text variant="body2" className="text-muted-foreground">
                  {activeAccount
                    ? `${activeAccount.name} selected`
                    : 'No item selected'}
                </Text>
              </div>
              <Button size="sm" className="gap-2">
                <Icon icon="mdi:plus" />
                Create Journal
                <Icon icon="mdi:chevron-down" />
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="icon" className="h-9 w-9">
                <Icon icon="mdi:filter-variant" />
              </Button>
              <Select
                value={listState.typeFilter}
                onValueChange={(value) =>
                  updateState({ typeFilter: value, page: 1 })
                }
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Journal Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="journal">Journal Type</SelectItem>
                  <SelectItem value="invoice">Invoice</SelectItem>
                  <SelectItem value="receipt">Receipt</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={listState.fieldFilter}
                onValueChange={(value) =>
                  updateState({ fieldFilter: value, page: 1 })
                }
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Field name" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="field-name">Field name</SelectItem>
                  <SelectItem value="ref-no">Ref No</SelectItem>
                  <SelectItem value="memo">Memo</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative flex-1 min-w-[180px]">
                <Input
                  placeholder="Search..."
                  className="pl-9"
                  value={listState.searchValue}
                  onChange={(event) =>
                    updateState({
                      searchValue: event.target.value,
                      page: 1,
                    })
                  }
                />
                <Icon
                  icon="mdi:magnify"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border">
              <table className="min-w-full text-sm">
                <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 text-left">Date</th>
                    <th className="px-3 py-2 text-left">Ref No.</th>
                    <th className="px-3 py-2 text-left">Type</th>
                    <th className="px-3 py-2 text-left">Currency</th>
                    <th className="px-3 py-2 text-left">Memo</th>
                    <th className="px-3 py-2 text-right">DR</th>
                    <th className="px-3 py-2 text-right">CR</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {rows.map((row) => (
                    <tr
                      key={`${row.refNo}-${row.date}`}
                      className="hover:bg-muted/30"
                    >
                      <td className="px-3 py-2 text-muted-foreground">
                        {row.date}
                      </td>
                      <td className="px-3 py-2 text-sky-600">{row.refNo}</td>
                      <td className="px-3 py-2">
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
                          {row.type}
                        </span>
                      </td>
                      <td className="px-3 py-2">{row.currency}</td>
                      <td className="px-3 py-2 text-muted-foreground">
                        {row.memo || '-'}
                      </td>
                      <td className="px-3 py-2 text-right">{row.dr}</td>
                      <td className="px-3 py-2 text-right font-semibold">
                        {row.cr}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <TablePagination
              pages={[1, 2, 3, 4, '...', 2309]}
              currentPage={listState.page}
              totalItems={46166}
              pageSize={listState.pageSize}
              pageSizeOptions={[10, 20, 50]}
              goToValue={String(listState.page)}
              onPrev={() =>
                updateState({
                  page: Math.max(1, listState.page - 1),
                })
              }
              onNext={() =>
                updateState({
                  page: Math.min(2309, listState.page + 1),
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
