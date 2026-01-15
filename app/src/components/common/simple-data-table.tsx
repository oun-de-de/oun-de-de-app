import { fNumber } from '@/utils/format-number';
import type { TransactionRow } from '@/types/common';
import styled from 'styled-components';

const TableWrap = styled.div.attrs({
  className: 'overflow-x-auto rounded-lg border',
})``;

const Table = styled.table.attrs({
  className: 'min-w-full text-sm',
})``;

const TableHead = styled.thead.attrs({
  className: 'bg-muted/40 text-xs uppercase text-muted-foreground',
})``;

const TableRow = styled.tr.attrs({
  className: 'hover:bg-muted/40',
})``;

type SimpleDataTableProps = {
  rows: TransactionRow[];
};

export function SimpleDataTable({ rows }: SimpleDataTableProps) {
  return (
    <TableWrap>
      <Table>
        <TableHead>
          <tr>
            <th className="px-3 py-2 text-left">Date</th>
            <th className="px-3 py-2 text-left">Ref No</th>
            <th className="px-3 py-2 text-left">Customer</th>
            <th className="px-3 py-2 text-left">Type</th>
            <th className="px-3 py-2 text-left">Ref Type</th>
            <th className="px-3 py-2 text-left">Status</th>
            <th className="px-3 py-2 text-right">Amount</th>
            <th className="px-3 py-2 text-left">Memo</th>
          </tr>
        </TableHead>
        <tbody className="divide-y">
          {rows.map((row) => (
            <TableRow key={row.refNo}>
              <td className="px-3 py-2 text-muted-foreground">{row.date}</td>
              <td className="px-3 py-2 text-sky-600">{row.refNo}</td>
              <td className="px-3 py-2">{row.customer}</td>
              <td className="px-3 py-2">
                <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs text-sky-700">
                  {row.type}
                </span>
              </td>
              <td className="px-3 py-2">
                <span className="rounded-md border px-2 py-0.5 text-xs text-muted-foreground">
                  {row.refType}
                </span>
              </td>
              <td className="px-3 py-2">
                <span className="rounded-md bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
                  {row.status}
                </span>
              </td>
              <td className="px-3 py-2 text-right font-semibold">
                {fNumber(row.amount)} KHR
              </td>
              <td className="px-3 py-2 text-muted-foreground">{row.memo}</td>
            </TableRow>
          ))}
        </tbody>
      </Table>
    </TableWrap>
  );
}
