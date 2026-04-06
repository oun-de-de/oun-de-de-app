import type { BasicStatus } from "./enum";

export type SummaryStatCardData = {
	label: string;
	value: number | string;
	color: string;
	icon: string;
};

export type EntityListItemData = {
	id: string;
	name: string;
	code: string;
	type?: string;
	status?: string | BasicStatus;
};

export type EntitySelectType = {
	key: string;
	value: string;
	label: string;
};

export type SelectOption = {
	value: string;
	label: string;
};

export type TransactionRow = {
	date: string;
	refNo: string;
	customer: string;
	type: string;
	refType: string;
	status: string;
	amount: number;
	memo: string;
};

export type VendorTransactionRow = {
	date: string;
	refNo: string;
	customer: string;
	vendor: string;
	type: string;
	refType: string;
	status: string;
	amount: number;
	memo: string;
};

export type ProductRow = {
	date: string;
	refNo: string;
	type: string;
	status: string;
	qty: number;
	cost: number;
	price: number;
	weight: number;
};

export type AccountingRow = {
	date: string;
	refNo: string;
	type: string;
	reason?: string;
	currency: string;
	memo: string;
	dr: string;
	cr: string;
};

type BaseSettingsRow = {
	id?: string;
	name: string;
	type: string;
};

export type WarehouseSettingsRow = BaseSettingsRow & {
	type: "Warehouse";
	descr?: string;
	location?: string;
};

export type SupplierSettingsRow = BaseSettingsRow & {
	type: "Supplier";
	descr?: string;
	address?: string;
	telephone?: string;
};

export type CurrencySettingsRow = BaseSettingsRow & {
	type: "Currency";
	descr?: string;
};

export type UnitSettingsRow = BaseSettingsRow & {
	descr?: string;
};

export type AccountingSettingsRow = BaseSettingsRow & {
	code?: string;
	descr?: string;
};

export type SettingsRow =
	| WarehouseSettingsRow
	| SupplierSettingsRow
	| CurrencySettingsRow
	| UnitSettingsRow
	| AccountingSettingsRow;

export type AuditLogRow = {
	date: string;
	user: string;
	event: string;
};

export type CouponRow = {
	couponNo: number;
	couponId?: number;
	couponDate?: string;
	plateNumber?: string;
	plateImage?: string;
	driverName?: string;
	customerCode?: string;
	customerName?: string;
	price1?: number;
	price2?: number;
	kgPerProd1?: number;
	kgPerProd2?: number;
	employerCode?: string;
	employerName?: string;
	remark?: string;
	accNo?: string;
	inWeight?: number;
	inTime?: string;
	inManual?: boolean;
	out1Weight?: number;
	out1Time?: string;
	out1Manual?: boolean;
	out2Weight?: number;
	out2Time?: string;
	out2Manual?: boolean;
	delAccNo?: string;
	delDate?: string;
	status?: string;
};

export type PaginatedResponse<T> = {
	content: T[];
	pageable: {
		pageNumber: number;
		pageSize: number;
		sort: {
			empty: boolean;
			sorted: boolean;
			unsorted: boolean;
		};
		offset: number;
		paged: boolean;
		unpaged: boolean;
	};
	totalElements: number;
	totalPages: number;
	last: boolean;
	size: number;
	number: number;
	sort: {
		empty: boolean;
		sorted: boolean;
		unsorted: boolean;
	};
	numberOfElements: number;
	first: boolean;
	empty: boolean;
};

export type PagePaginatedResponse<T> = {
	content: T[];
	page: {
		size: number;
		number: number;
		totalElements: number;
		totalPages: number;
	};
};

export type CodeResponse = {
	code: string;
};
