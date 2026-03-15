import { useQuery } from "@tanstack/react-query";
import type {
	CashTransaction,
	CashTransactionCounterparty,
	CashTransactionDataset,
	CashTransactionSummary,
} from "@/core/types/cash-transaction";

const UNASSIGNED_COUNTERPARTY_ID = "__unassigned__";
const UNASSIGNED_COUNTERPARTY_LABEL = "Unassigned";

const CASH_TRANSACTION_ACCOUNT_LABEL = "10110 : ប្រាក់សុទ្ធ (Cash on hand)";

const MOCK_CASH_TRANSACTIONS: CashTransaction[] = [
	{
		id: "1247",
		no: 1,
		date: "11/03/2026",
		refNo: "1247",
		type: "General",
		counterpartyId: UNASSIGNED_COUNTERPARTY_ID,
		counterpartyName: UNASSIGNED_COUNTERPARTY_LABEL,
		memo: "អតិថិជនសងប្រាក់",
		debit: 110000,
		credit: 0,
		balance: 1157648800,
	},
	{
		id: "CS0001292012",
		no: 2,
		date: "11/03/2026",
		refNo: "CS0001292012",
		type: "Cash_Sale",
		counterpartyId: "counterparty-vin",
		counterpartyName: "វីន",
		memo: "-",
		debit: 26000,
		credit: 0,
		balance: 1157674800,
	},
	{
		id: "CS0001292013",
		no: 3,
		date: "11/03/2026",
		refNo: "CS0001292013",
		type: "Cash_Sale",
		counterpartyId: "counterparty-phak",
		counterpartyName: "ភ័ក្រ (តេប៉ូ) 2B-2083",
		memo: "-",
		debit: 66000,
		credit: 0,
		balance: 1157740800,
	},
	{
		id: "CS0001292014",
		no: 4,
		date: "11/03/2026",
		refNo: "CS0001292014",
		type: "Cash_Sale",
		counterpartyId: "counterparty-poch",
		counterpartyName: "ប៉ូច (2Z-6924)",
		memo: "-",
		debit: 12000,
		credit: 0,
		balance: 1157752800,
	},
	{
		id: "CS0001292015",
		no: 5,
		date: "11/03/2026",
		refNo: "CS0001292015",
		type: "Cash_Sale",
		counterpartyId: "counterparty-hong-ming",
		counterpartyName: "ហុង មីង",
		memo: "-",
		debit: 6000,
		credit: 0,
		balance: 1157758800,
	},
	{
		id: "RC00004581",
		no: 6,
		date: "11/03/2026",
		refNo: "RC00004581",
		type: "Receipt",
		counterpartyId: "counterparty-rongvong",
		counterpartyName: "រង្វង់មូលកាំកូ",
		memo: "Customer payment",
		debit: 350000,
		credit: 0,
		balance: 1158108800,
	},
	{
		id: "RC00004582",
		no: 7,
		date: "11/03/2026",
		refNo: "RC00004582",
		type: "Receipt",
		counterpartyId: "counterparty-samnang-remork",
		counterpartyName: "សំណាង(រឺម៉ក)",
		memo: "Advance collection",
		debit: 180000,
		credit: 0,
		balance: 1158288800,
	},
	{
		id: "CS0001292016",
		no: 8,
		date: "11/03/2026",
		refNo: "CS0001292016",
		type: "Cash_Sale",
		counterpartyId: "counterparty-sophak",
		counterpartyName: "សុភ័ក្រ",
		memo: "-",
		debit: 42000,
		credit: 0,
		balance: 1158330800,
	},
	{
		id: "CS0001292017",
		no: 9,
		date: "11/03/2026",
		refNo: "CS0001292017",
		type: "Cash_Sale",
		counterpartyId: "counterparty-bongleng",
		counterpartyName: "បងលេង អូដឹម",
		memo: "-",
		debit: 54000,
		credit: 0,
		balance: 1158384800,
	},
	{
		id: "EXP005690",
		no: 10,
		date: "11/03/2026",
		refNo: "EXP005690",
		type: "Expense",
		counterpartyId: UNASSIGNED_COUNTERPARTY_ID,
		counterpartyName: UNASSIGNED_COUNTERPARTY_LABEL,
		memo: "Fuel expense",
		debit: 0,
		credit: 85000,
		balance: 1158299800,
	},
	{
		id: "CS0001292018",
		no: 11,
		date: "11/03/2026",
		refNo: "CS0001292018",
		type: "Cash_Sale",
		counterpartyId: "counterparty-zhouliang",
		counterpartyName: "ជូ លៀង",
		memo: "-",
		debit: 32000,
		credit: 0,
		balance: 1158331800,
	},
	{
		id: "RC00004583",
		no: 12,
		date: "11/03/2026",
		refNo: "RC00004583",
		type: "Receipt",
		counterpartyId: "counterparty-kri",
		counterpartyName: "គ្រី (2AL-1746)",
		memo: "Loan repayment",
		debit: 220000,
		credit: 0,
		balance: 1158551800,
	},
	{
		id: "CS0001292019",
		no: 13,
		date: "11/03/2026",
		refNo: "CS0001292019",
		type: "Cash_Sale",
		counterpartyId: "counterparty-rotha",
		counterpartyName: "រដ្ធា (រម៉កគ្រី)",
		memo: "-",
		debit: 28000,
		credit: 0,
		balance: 1158579800,
	},
	{
		id: "EXP005691",
		no: 14,
		date: "11/03/2026",
		refNo: "EXP005691",
		type: "Expense",
		counterpartyId: UNASSIGNED_COUNTERPARTY_ID,
		counterpartyName: UNASSIGNED_COUNTERPARTY_LABEL,
		memo: "Bank service fee",
		debit: 0,
		credit: 200000,
		balance: 1158379800,
	},
	{
		id: "CS0001292020",
		no: 15,
		date: "11/03/2026",
		refNo: "CS0001292020",
		type: "Cash_Sale",
		counterpartyId: "counterparty-cheat",
		counterpartyName: "ជាតិ 2W-2419",
		memo: "-",
		debit: 48000,
		credit: 0,
		balance: 1158427800,
	},
	{
		id: "RC00004584",
		no: 16,
		date: "11/03/2026",
		refNo: "RC00004584",
		type: "Receipt",
		counterpartyId: "counterparty-vandy",
		counterpartyName: "វណ្ណឌី (ស្រីអូន) ( 3D-7636 )",
		memo: "Customer deposit",
		debit: 125000,
		credit: 0,
		balance: 1158552800,
	},
	{
		id: "CS0001292021",
		no: 17,
		date: "11/03/2026",
		refNo: "CS0001292021",
		type: "Cash_Sale",
		counterpartyId: "counterparty-hieng",
		counterpartyName: "ហៀង (រម៉ក)",
		memo: "-",
		debit: 70000,
		credit: 0,
		balance: 1158622800,
	},
	{
		id: "EXP005692",
		no: 18,
		date: "11/03/2026",
		refNo: "EXP005692",
		type: "Expense",
		counterpartyId: UNASSIGNED_COUNTERPARTY_ID,
		counterpartyName: UNASSIGNED_COUNTERPARTY_LABEL,
		memo: "Repair tools",
		debit: 0,
		credit: 2500,
		balance: 1158620300,
	},
	{
		id: "CS0001292022",
		no: 19,
		date: "11/03/2026",
		refNo: "CS0001292022",
		type: "Cash_Sale",
		counterpartyId: "counterparty-phou",
		counterpartyName: "ផូ (3F-8245)",
		memo: "-",
		debit: 51000,
		credit: 0,
		balance: 1158671300,
	},
	{
		id: "RC00004585",
		no: 20,
		date: "11/03/2026",
		refNo: "RC00004585",
		type: "Receipt",
		counterpartyId: "counterparty-samnang-2a",
		counterpartyName: "សំណាង 2A-2044",
		memo: "Cash receive",
		debit: 95000,
		credit: 0,
		balance: 1158766300,
	},
];

const formatTypeLabel = (value: string) =>
	value
		.split("_")
		.filter(Boolean)
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
		.join(" ");

const counterpartyCounts = new Map<string, { name: string; count: number }>();
const transactionTypes = new Set<string>();
const summary = MOCK_CASH_TRANSACTIONS.reduce<CashTransactionSummary>(
	(accumulator, row) => {
		const entry = counterpartyCounts.get(row.counterpartyId);
		if (entry) {
			entry.count += 1;
		} else {
			counterpartyCounts.set(row.counterpartyId, {
				name: row.counterpartyName,
				count: 1,
			});
		}

		transactionTypes.add(row.type);

		accumulator.count += 1;
		accumulator.debit += row.debit;
		accumulator.credit += row.credit;
		accumulator.balance = row.balance;

		return accumulator;
	},
	{ count: 0, debit: 0, credit: 0, balance: 0 },
);

// Sidebar uses a de-duplicated list of transaction counterparties instead of raw rows.
const counterparties: CashTransactionCounterparty[] = Array.from(counterpartyCounts.entries())
	.map(([id, value]) => ({
		id,
		name: value.name,
		code: `${value.count} tx`,
	}))
	.toSorted((a, b) => a.name.localeCompare(b.name));

const CASH_TRANSACTION_DATASET: CashTransactionDataset = {
	accountLabel: CASH_TRANSACTION_ACCOUNT_LABEL,
	rows: MOCK_CASH_TRANSACTIONS,
	counterparties,
	typeOptions: [
		{ value: "all", label: "All" },
		...Array.from(transactionTypes).map((type) => ({
			value: type,
			label: formatTypeLabel(type),
		})),
	],
	summary,
};

export function useAccountingCenter() {
	return useQuery({
		queryKey: ["accounting-center"],
		queryFn: async () => CASH_TRANSACTION_DATASET,
		staleTime: Infinity,
	});
}
