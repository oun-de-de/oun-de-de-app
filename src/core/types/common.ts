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
	status?: string;
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
	name: string;
	type: string;
};

export type AuditLogRow = {
	date: string;
	user: string;
	event: string;
};
