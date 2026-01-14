import { ReactNode } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardAction } from '@/ui/card';

export type DashboardCardProps = {
  title: ReactNode;
  subheader?: ReactNode;
  children?: ReactNode;
};

export default function DashboardCard({ title, subheader, children }: DashboardCardProps) {
  return (
    <Card>
      <CardHeader className={subheader ? "justify-between" : undefined}>
        <CardTitle className={subheader ? "text-left" : undefined}>{title}</CardTitle>
        {subheader ? <CardAction>{subheader}</CardAction> : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

