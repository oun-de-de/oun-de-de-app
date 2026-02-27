import { Plus, Trash2 } from "lucide-react";
import type { Product } from "@/core/types/product";
import { Badge } from "@/core/ui/badge";
import { Button } from "@/core/ui/button";
import { Input } from "@/core/ui/input";
import { Label } from "@/core/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/ui/select";

export type DraftWeightRecord = {
	productId?: string;
	productName: string | null;
	unit: string | null;
	pricePerProduct: number | null;
	quantityPerProduct: number | null;
	quantity: number | null;
	weight: number | null;
	outTime: string;
	memo: string | null;
	manual: boolean;
};

type WeightRecordsBuilderProps = {
	products: Product[];
	records: DraftWeightRecord[];
	onChange: (records: DraftWeightRecord[]) => void;
};

function toDateTimeLocalValue(value: string): string {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return "";
	const pad = (n: number) => n.toString().padStart(2, "0");
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function toIsoOrNow(value: string): string {
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

export function createInitialRawWeightRecord(): DraftWeightRecord {
	return {
		productName: null,
		unit: null,
		pricePerProduct: null,
		quantityPerProduct: null,
		quantity: null,
		weight: null,
		outTime: new Date().toISOString(),
		memo: null,
		manual: true,
	};
}

export function WeightRecordsBuilder({ products, records, onChange }: WeightRecordsBuilderProps) {
	const addProductRecord = () => {
		onChange([
			...records,
			{
				productId: undefined,
				productName: null,
				unit: null,
				pricePerProduct: null,
				quantityPerProduct: null,
				quantity: null,
				weight: null,
				outTime: new Date().toISOString(),
				memo: null,
				manual: true,
			},
		]);
	};

	const removeRecord = (index: number) => {
		if (index === 0) return;
		onChange(records.filter((_, i) => i !== index));
	};

	const updateRecord = (index: number, patch: Partial<DraftWeightRecord>) => {
		onChange(records.map((record, i) => (i === index ? { ...record, ...patch } : record)));
	};

	const handleSelectProduct = (index: number, productId: string) => {
		const product = products.find((p) => p.id === productId);
		if (!product) return;
		updateRecord(index, {
			productId: product.id,
			productName: product.name,
			unit: product.unit?.name ?? null,
			pricePerProduct: product.defaultProductSetting?.price ?? null,
			quantityPerProduct: product.defaultProductSetting?.quantity ?? null,
		});
	};

	return (
		<div className="rounded-md border p-4 space-y-3">
			<div className="flex items-center justify-between">
				<div>
					<Label className="text-sm font-semibold">Weight Records</Label>
					<p className="text-xs text-slate-500 mt-1">
						First record must be raw vehicle weighing, then cumulative product records.
					</p>
				</div>
				<Button type="button" size="sm" variant="outline" onClick={addProductRecord}>
					<Plus className="mr-1 h-4 w-4" />
					Add Product Record
				</Button>
			</div>

			<div className="space-y-3">
				{records.map((record, index) => (
					<div key={`weight-record-${index}`} className="rounded border bg-slate-50 p-3 space-y-3">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<Badge variant={index === 0 ? "secondary" : "info"}>Record #{index + 1}</Badge>
								{index === 0 && <span className="text-xs text-slate-500">Raw vehicle</span>}
							</div>
							{index > 0 && (
								<Button type="button" size="sm" variant="ghost" onClick={() => removeRecord(index)}>
									<Trash2 className="h-4 w-4 text-red-600" />
								</Button>
							)}
						</div>

						{index > 0 && (
							<div className="space-y-1">
								<Label>Product</Label>
								<Select value={record.productId} onValueChange={(value) => handleSelectProduct(index, value)}>
									<SelectTrigger>
										<SelectValue placeholder="Select product" />
									</SelectTrigger>
									<SelectContent>
										{products.map((product) => (
											<SelectItem key={product.id} value={product.id}>
												{product.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						)}

						<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
							<div className="space-y-1">
								<Label>Weight (Accumulated)</Label>
								<Input
									type="number"
									value={record.weight ?? ""}
									onChange={(e) => updateRecord(index, { weight: e.target.value ? Number(e.target.value) : null })}
								/>
							</div>
							<div className="space-y-1">
								<Label>Quantity</Label>
								<Input
									type="number"
									value={record.quantity ?? ""}
									onChange={(e) => updateRecord(index, { quantity: e.target.value ? Number(e.target.value) : null })}
								/>
							</div>
							<div className="space-y-1">
								<Label>Unit</Label>
								<Input
									value={record.unit ?? ""}
									onChange={(e) => updateRecord(index, { unit: e.target.value || null })}
								/>
							</div>
							<div className="space-y-1">
								<Label>Price Per Product</Label>
								<Input
									type="number"
									value={record.pricePerProduct ?? ""}
									onChange={(e) =>
										updateRecord(index, { pricePerProduct: e.target.value ? Number(e.target.value) : null })
									}
								/>
							</div>
							<div className="space-y-1">
								<Label>Quantity Per Product</Label>
								<Input
									type="number"
									value={record.quantityPerProduct ?? ""}
									onChange={(e) =>
										updateRecord(index, { quantityPerProduct: e.target.value ? Number(e.target.value) : null })
									}
								/>
							</div>
							<div className="space-y-1">
								<Label>Out Time</Label>
								<Input
									type="datetime-local"
									value={toDateTimeLocalValue(record.outTime)}
									onChange={(e) => updateRecord(index, { outTime: toIsoOrNow(e.target.value) })}
								/>
							</div>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
							<div className="space-y-1">
								<Label>Memo</Label>
								<Input
									value={record.memo ?? ""}
									onChange={(e) => updateRecord(index, { memo: e.target.value || null })}
								/>
							</div>
							<div className="space-y-1">
								<Label>Input Mode</Label>
								<Select
									value={record.manual ? "manual" : "auto"}
									onValueChange={(value) => updateRecord(index, { manual: value === "manual" })}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="manual">Manual</SelectItem>
										<SelectItem value="auto">Auto</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
