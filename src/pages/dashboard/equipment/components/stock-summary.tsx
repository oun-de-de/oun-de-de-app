import type { InventoryItem } from "@/core/types/inventory";
import { Badge } from "@/core/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/core/ui/card";

interface StockSummaryProps {
	items: InventoryItem[];
}

export function StockSummary({ items }: StockSummaryProps) {
	return (
		<Card className="xl:col-span-1">
			<CardHeader className="pb-3">
				<CardTitle className="text-base">Stock Summary</CardTitle>
			</CardHeader>
			<CardContent className="space-y-2">
				{items.map((item) => {
					const isLowStock = item.quantityOnHand <= item.alertThreshold;
					return (
						<div key={item.id} className="rounded-md border p-3 text-sm">
							<div className="mb-2 flex items-center justify-between gap-2">
								<div>
									<div className="font-medium text-slate-700">{item.name}</div>
									<div className="text-xs text-slate-500">Threshold: {item.alertThreshold}</div>
								</div>
								<Badge variant={isLowStock ? "warning" : "success"}>{isLowStock ? "Low Stock" : "Normal"}</Badge>
							</div>
							<div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
								<div>On Hand: {item.quantityOnHand}</div>
								<div>Unit: {item.unit?.name ?? "-"}</div>
							</div>
						</div>
					);
				})}
			</CardContent>
		</Card>
	);
}
