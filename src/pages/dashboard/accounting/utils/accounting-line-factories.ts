export type ExpenseLine = {
	id: string;
	accountCode: string;
	memo: string;
	amount: string;
	name: string;
	nameInput: string;
	className: string;
};

export type RevenueLine = {
	id: string;
	accountCode: string;
	memo: string;
	amount: string;
	name: string;
	className: string;
};

export type JournalLine = {
	id: string;
	accountCode: string;
	dr: string;
	cr: string;
	memo: string;
	name: string;
	className: string;
};

export type TransactionLine = {
	id: string;
	accountCode: string;
	memo: string;
	payMethod: string;
	amount: string;
	customerId: string;
	className: string;
};

function createLineId(index: number) {
	return `line-${index + 1}`;
}

export function createEmptyExpenseLine(index: number): ExpenseLine {
	return {
		id: createLineId(index),
		accountCode: "",
		memo: "",
		amount: "",
		name: "",
		nameInput: "",
		className: "",
	};
}

export function createEmptyRevenueLine(index: number): RevenueLine {
	return {
		id: createLineId(index),
		accountCode: "",
		memo: "",
		amount: "",
		name: "",
		className: "",
	};
}

export function createEmptyJournalLine(index: number): JournalLine {
	return {
		id: createLineId(index),
		accountCode: "",
		dr: "",
		cr: "",
		memo: "",
		name: "",
		className: "",
	};
}

export function createEmptyTransactionLine(index: number): TransactionLine {
	return {
		id: createLineId(index),
		accountCode: "",
		memo: "",
		payMethod: "",
		amount: "",
		customerId: "",
		className: "",
	};
}
