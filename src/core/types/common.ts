import type { BasicStatus } from "./enum";

export type SummaryStatCardData = {
	label: string;
	value: number;
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
	currency: string;
	memo: string;
	dr: string;
	cr: string;
};

export type SettingsRow = {
	id?: string;
	name: string;
	type: string;
	descr?: string;
	location?: string;
};

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
