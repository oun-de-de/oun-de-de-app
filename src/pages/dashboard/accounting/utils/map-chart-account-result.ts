import type { AccountTypeResult, ChartOfAccountResult } from "@/core/types/accounting";
import type { AccountingAccountListItem } from "../types";

export function formatChartAccountLabel(account: Pick<ChartOfAccountResult, "code" | "name">) {
	const code = account.code?.trim() ?? "";
	const name = account.name?.trim() ?? "";
	return code ? `${code} : ${name}` : name;
}

export function buildAccountTypeMap(accountTypes: AccountTypeResult[]) {
	return accountTypes.reduce<Record<string, AccountTypeResult>>((acc, item) => {
		acc[item.id] = item;
		return acc;
	}, {});
}

export function getChartAccountAccountTypeId(account: ChartOfAccountResult) {
	return account.accountTypeId ?? account.accountType?.id ?? "";
}

export function mapChartOfAccountToListItem(
	account: ChartOfAccountResult,
	accountType?: AccountTypeResult,
): AccountingAccountListItem {
	const code = account.code?.trim() ?? "";
	const resolvedAccountTypeId = getChartAccountAccountTypeId(account);

	return {
		id: account.id,
		name: formatChartAccountLabel(account),
		code,
		type: accountType?.nature?.toLowerCase(),
		status: "active",
		accountTypeId: resolvedAccountTypeId,
		descr: account.descr,
	};
}
