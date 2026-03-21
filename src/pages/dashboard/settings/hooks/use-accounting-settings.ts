import { useMutation, useQueryClient } from "@tanstack/react-query";
import accountingService from "@/core/api/services/accounting-service";
import type {
	CreateAccountTypeRequest,
	CreateChartOfAccountRequest,
	CreateJournalClassRequest,
	CreateJournalTypeRequest,
} from "@/core/types/accounting";
import { ACCOUNTING_QUERY_KEYS } from "@/pages/dashboard/accounting/constants";

export function useCreateAccountingSetting() {
	const queryClient = useQueryClient();

	const invalidateAccountingQueries = async () => {
		await Promise.all([
			queryClient.invalidateQueries({ queryKey: ACCOUNTING_QUERY_KEYS.referenceAccountTypes }),
			queryClient.invalidateQueries({ queryKey: ACCOUNTING_QUERY_KEYS.referenceChartAccounts }),
			queryClient.invalidateQueries({ queryKey: ACCOUNTING_QUERY_KEYS.referenceJournalTypes }),
			queryClient.invalidateQueries({ queryKey: ACCOUNTING_QUERY_KEYS.referenceJournalClasses }),
			queryClient.invalidateQueries({ queryKey: ACCOUNTING_QUERY_KEYS.chartAccounts }),
			queryClient.invalidateQueries({ queryKey: ACCOUNTING_QUERY_KEYS.accountTypes }),
		]);
	};

	const createChartOfAccount = useMutation({
		mutationFn: (data: CreateChartOfAccountRequest) => accountingService.createChartOfAccount(data),
		onSuccess: invalidateAccountingQueries,
	});

	const createAccountType = useMutation({
		mutationFn: (data: CreateAccountTypeRequest) => accountingService.createAccountType(data),
		onSuccess: invalidateAccountingQueries,
	});

	const createJournalType = useMutation({
		mutationFn: (data: CreateJournalTypeRequest) => accountingService.createJournalType(data),
		onSuccess: invalidateAccountingQueries,
	});

	const createJournalClass = useMutation({
		mutationFn: (data: CreateJournalClassRequest) => accountingService.createJournalClass(data),
		onSuccess: invalidateAccountingQueries,
	});

	return {
		createChartOfAccount,
		createAccountType,
		createJournalType,
		createJournalClass,
		isPending:
			createChartOfAccount.isPending ||
			createAccountType.isPending ||
			createJournalType.isPending ||
			createJournalClass.isPending,
	};
}
