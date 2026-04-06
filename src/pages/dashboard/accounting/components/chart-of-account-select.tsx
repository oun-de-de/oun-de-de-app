import { type Control, type FieldValues, type FieldPath } from "react-hook-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/ui/select";
import { Controller } from "react-hook-form";
import { AccountingSelectOptionContent } from "./accounting-select-option-content";
import type { ChartOfAccountResult } from "@/core/types/accounting";
import { useMemo } from "react";
import { cn } from "@/core/utils";

interface ChartOfAccountSelectProps<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
	control: Control<TFieldValues>;
	name: TName;
	accounts: ChartOfAccountResult[];
	isLoading?: boolean;
	placeholder?: string;
	error?: string;
	className?: string;
}

export function ChartOfAccountSelect<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
	control,
	name,
	accounts,
	isLoading,
	placeholder = "Select account",
	error,
	className,
}: ChartOfAccountSelectProps<TFieldValues, TName>) {
	const accountMap = useMemo(() => new Map(accounts.map((acc) => [acc.id, acc])), [accounts]);

	const getLabel = (acc?: ChartOfAccountResult) => (acc?.code && acc?.name ? `${acc.code} : ${acc.name}` : "");

	return (
		<Controller
			control={control}
			name={name}
			render={({ field }) => {
				const selectedAccount = accountMap.get(field.value);

				return (
					<div className={cn("w-full", className)}>
						<Select value={field.value} onValueChange={field.onChange}>
							<SelectTrigger
								disabled={isLoading}
								className={cn(
									"bg-white h-11 border-slate-200 hover:border-slate-300 transition-all",
									error && "border-rose-500 ring-rose-500",
									!field.value && "text-muted-foreground",
								)}
							>
								{selectedAccount ? (
									<span className="truncate">{getLabel(selectedAccount)}</span>
								) : (
									<SelectValue placeholder={placeholder} />
								)}
							</SelectTrigger>
							<SelectContent>
								{accounts.map((account) => (
									<SelectItem key={account.id} value={account.id} className="relative pr-40">
										<AccountingSelectOptionContent
											primary={getLabel(account)}
											secondary={account.accountType?.name ?? account.accountType?.nature ?? "-"}
											rightPaddingClassName="pr-32"
										/>
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				);
			}}
		/>
	);
}
