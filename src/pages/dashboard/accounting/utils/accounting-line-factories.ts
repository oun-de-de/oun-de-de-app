export type ExpenseLine = {
	id: string;
	accountCode: string;
	memo: string;
	amount: string;
	customerId: string;
	className: string;
};

export type RevenueLine = {
	id: string;
	accountCode: string;
	memo: string;
	amount: string;
	customerId: string;
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

let lineIdCounter = 0;

function createLineId(_index?: number) {
	lineIdCounter += 1;
	return `line-${lineIdCounter}`;
}

export function createEmptyExpenseLine(): ExpenseLine {
	return {
		id: createLineId(),
		accountCode: "",
		memo: "",
		amount: "",
		customerId: "",
		className: "",
	};
}

export function createEmptyRevenueLine(): RevenueLine {
	return {
		id: createLineId(),
		accountCode: "",
		memo: "",
		amount: "",
		customerId: "",
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
