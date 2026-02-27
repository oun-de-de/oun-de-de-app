export type MainReportRow = {
	invoiceNo: string;
	invoiceDate: string;
	customer: string;
	couponId: string;
	cycle: string;
	amountVnd: string;
	paymentTerm: string;
	createdBy: string;
};

export type CycleReportRow = {
	customer: string;
	cycle: string;
	openingBalance: string;
	invoiceTotal: string;
	paid: string;
	outstanding: string;
};
