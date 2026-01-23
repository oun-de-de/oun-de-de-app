import { Card, CardContent } from "@/core/ui/card";
import { ReactNode } from "react";

type SaleLayoutProps = {
	leftContent: ReactNode;
	rightContent: ReactNode;
};

export function SaleLayout({ leftContent, rightContent }: SaleLayoutProps) {
	return (
		<div className="grid grid-cols-20 gap-2 h-full min-h-0 flex-1">
			<Card className="col-span-9 h-full">
				<CardContent className="h-full flex flex-col min-h-0">{leftContent}</CardContent>
			</Card>

			<Card className="col-span-11 h-full">
				<CardContent className="h-full flex flex-col gap-4 min-h-0">{rightContent}</CardContent>
			</Card>
		</div>
	);
}
