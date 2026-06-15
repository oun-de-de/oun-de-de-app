import type { WeightRecord } from "@/core/types/coupon";
import type { Product } from "@/core/types/product";
import { formatDateTimeLocalApiValue } from "@/pages/dashboard/accounting/utils/format-local-date-time";

const LEGACY_PRODUCT_VALUE_PREFIX = "legacy-product:";

export type DraftWeightRecord = {
	draftId: string;
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

type DraftWeightRecordInput = Partial<DraftWeightRecord> & Pick<DraftWeightRecord, "outTime">;

function normalizeProductName(value: string | null | undefined): string {
	return (value ?? "").trim().toLowerCase();
}

function compareWeightRecordsByCumulativeWeight(a: WeightRecord, b: WeightRecord) {
	if (a.weight == null && b.weight == null) return 0;
	if (a.weight == null) return 1;
	if (b.weight == null) return -1;
	return a.weight - b.weight;
}

function getRecordDraftId(record: WeightRecord | DraftWeightRecord): string {
	if ("draftId" in record) return record.draftId;
	return record.id ?? createDraftWeightRecordId();
}

function createDraftWeightRecordId(): string {
	return globalThis.crypto?.randomUUID?.() ?? `draft-weight-record-${Date.now()}-${Math.random()}`;
}

export function createLegacyProductValue(productName: string): string {
	return `${LEGACY_PRODUCT_VALUE_PREFIX}${productName}`;
}

export function isLegacyProductValue(value: string): boolean {
	return value.startsWith(LEGACY_PRODUCT_VALUE_PREFIX);
}

export function createDraftWeightRecord(input: DraftWeightRecordInput): DraftWeightRecord {
	return {
		draftId: input.draftId ?? createDraftWeightRecordId(),
		productId: input.productId,
		productName: input.productName ?? null,
		unit: input.unit ?? null,
		pricePerProduct: input.pricePerProduct ?? null,
		quantityPerProduct: input.quantityPerProduct ?? null,
		quantity: input.quantity ?? null,
		weight: input.weight ?? null,
		outTime: input.outTime,
		memo: input.memo ?? null,
		manual: input.manual ?? true,
	};
}

export function createEmptyDraftWeightRecord(): DraftWeightRecord {
	return createDraftWeightRecord({
		productName: null,
		outTime: formatDateTimeLocalApiValue(),
	});
}

export function normalizeDraftWeightRecords(
	couponWeightRecords: WeightRecord[],
	products: Product[],
): DraftWeightRecord[] {
	if (couponWeightRecords.length === 0) {
		return [createEmptyDraftWeightRecord()];
	}

	const rawRecordIndex = couponWeightRecords.findIndex((record) => record.productName === null);
	const productRecords =
		rawRecordIndex >= 0 ? couponWeightRecords.filter((_, index) => index !== rawRecordIndex) : couponWeightRecords;
	const orderedRecords =
		rawRecordIndex >= 0
			? [couponWeightRecords[rawRecordIndex], ...productRecords.toSorted(compareWeightRecordsByCumulativeWeight)]
			: [createEmptyDraftWeightRecord(), ...productRecords.toSorted(compareWeightRecordsByCumulativeWeight)];

	return orderedRecords.map((record, index) => {
		const product =
			index === 0 || record.productName === null
				? null
				: products.find((item) => normalizeProductName(item.name) === normalizeProductName(record.productName));

		return createDraftWeightRecord({
			draftId: getRecordDraftId(record),
			productId:
				product?.id ?? (index > 0 && record.productName ? createLegacyProductValue(record.productName) : undefined),
			productName: index === 0 ? null : record.productName || null,
			unit: record.unit,
			pricePerProduct: record.pricePerProduct,
			quantityPerProduct: record.quantityPerProduct,
			quantity: record.quantity,
			weight: record.weight,
			outTime: record.outTime,
			memo: record.memo,
			manual: record.manual,
		});
	});
}

// mapping back to weight record format, removing draftId and productId, and keeping productName for legacy unmatched products
export function serializeDraftWeightRecords(records: DraftWeightRecord[]): WeightRecord[] {
	return records.map((record) => ({
		productName: record.productName,
		unit: record.unit,
		pricePerProduct: record.pricePerProduct,
		quantityPerProduct: record.quantityPerProduct,
		quantity: record.quantity,
		weight: record.weight,
		outTime: record.outTime,
		memo: record.memo,
		manual: record.manual,
	}));
}

export function validateCumulativeWeightRecords(records: DraftWeightRecord[]): string | null {
	if (records.length === 0) return "At least one weight record is required.";
	if (records[0].productName !== null) {
		return "The first record must be raw vehicle weighing (productName = null).";
	}

	let previousWeight: number | null = null;
	for (let i = 0; i < records.length; i++) {
		const record = records[i];
		if (record.weight !== null && previousWeight !== null && record.weight < previousWeight) {
			return `Record #${i + 1} Weight (Accumulated) must be greater than or equal to Record #${i}. Current value: ${record.weight}; previous value: ${previousWeight}.`;
		}
		if (record.weight !== null) previousWeight = record.weight;
	}

	return null;
}
