import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { BackButton, SplitButton } from "@/core/components/common";
import { loadingOverlay } from "@/core/components/loading/controllers/loading-overlay-controller";
import type { CreateCashTransactionRequest } from "@/core/types/cash-transaction";
import type { InvoiceExportPreviewLocationState } from "@/core/types/invoice";
import { Button } from "@/core/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/core/ui/card";
import { useCreateCashTransaction } from "@/pages/dashboard/accounting-center/hooks/use-create-cash-transaction";
import { useGetCurrencyList } from "@/pages/dashboard/settings/hooks/use-settings";
import { CashTransactionDetailsTable } from "../components/cash-transaction-details-table";
import { CashTransactionFormHeader } from "../components/cash-transaction-form-header";
import {
	ACCOUNTING_DRAFT_FORM_TEXT,
	ACCOUNTING_FORM_TRANSACTION_TYPES,
	ACCOUNTING_TRANSACTION_TYPE_TO_API,
} from "../constants";
import { useAccountingReferenceData } from "../hooks/use-accounting-reference-data";
import type { CashTransactionFormValues } from "../utils/accounting-form-utils";
import {
	cashTransactionFormSchema,
	generateCashTransactionDateTime,
	generateId,
	generateRefNo,
} from "../utils/accounting-form-utils";
import { formatDateTimeLocalApiValueFromInput } from "../utils/format-local-date-time";
import { getChartAccountAccountTypeId } from "../utils/map-chart-account-result";

function buildRevenuePreviewState({
	refNo,
	date,
	formValues,
	employeeOptions,
	chartAccountLabels,
}: {
	refNo: string;
	date: string;
	formValues: CashTransactionFormValues;
	employeeOptions: { value: string; label: string }[];
	chartAccountLabels: Map<string, string>;
}): InvoiceExportPreviewLocationState {
	const employeeName =
		employeeOptions.find((option) => option.value === formValues.employeeId)?.label ?? "Administrator";
	const previewRows = formValues.details.map((line, index) => ({
		refNo: index === 0 ? refNo : `${refNo}-${index + 1}`,
		customerName: employeeName,
		date,
		productName: chartAccountLabels.get(line.accountCode) ?? "Revenue Item",
		unit: null,
		pricePerProduct: line.amount,
		quantityPerProduct: 1,
		quantity: 1,
		amount: line.amount,
		total: line.amount,
		memo: line.memo.trim() || formValues.memo.trim() || "Revenue voucher",
		paid: line.amount,
		balance: 0,
	}));

	return {
		selectedInvoiceIds: [],
		previewRows,
		returnPath: "/dashboard/accounting",
		receiptPaymentAmount: previewRows.reduce((sum, row) => sum + (row.amount ?? 0), 0),
		receiptPaymentCode: refNo,
		receiptPaymentDate: date,
		autoPrint: true,
		initialPaperSizeMode: "a5",
		initialOrientationMode: "landscape",
	};
}

export default function CreateRevenuePage() {
	const navigate = useNavigate();
	const { chartAccounts, customerOptions, employeeOptions, isLoading, journalClassOptions } =
		useAccountingReferenceData({
			accountTypesEnabled: false,
			journalTypesEnabled: false,
			customersEnabled: true,
			loadChartAccountType: true,
		});

	const { data: currencies = [], isLoading: isLoadingCurrencies } = useGetCurrencyList();
	const { mutateAsync: createCashTransaction, isPending: isSubmitting } = useCreateCashTransaction();

	const defaultCurrencyId = useMemo(() => currencies[1]?.id ?? currencies[0]?.id ?? "", [currencies]);

	const form = useForm<CashTransactionFormValues>({
		resolver: zodResolver(cashTransactionFormSchema),
		defaultValues: {
			refNo: generateRefNo("REV"),
			date: generateCashTransactionDateTime(),
			currencyId: defaultCurrencyId,
			employeeId: "",
			memo: "",
			details: [
				{
					id: generateId(),
					accountCode: "",
					memo: "",
					amount: 0,
					customerId: "",
					className: "",
				},
			],
		},
	});

	const { handleSubmit, reset } = form;

	const currencyOptions = useMemo(() => currencies.map((item) => ({ value: item.id, label: item.name })), [currencies]);
	const chartAccountMap = useMemo(
		() => new Map(chartAccounts.map((account) => [account.id, account])),
		[chartAccounts],
	);

	useEffect(() => {
		if (!form.getValues("currencyId") && defaultCurrencyId) {
			form.setValue("currencyId", defaultCurrencyId, { shouldValidate: true });
		}
	}, [defaultCurrencyId, form]);

	const onFormSubmit = async (values: CashTransactionFormValues, mode: "close" | "new" | "print") => {
		const serializedDate = formatDateTimeLocalApiValueFromInput(values.date);
		if (!serializedDate) {
			toast.error("Date is invalid");
			return;
		}

		const details: CreateCashTransactionRequest["cashTransactionDetails"] = [];

		for (const line of values.details) {
			const lineChartAccount = chartAccountMap.get(line.accountCode);
			const accountTypeId = lineChartAccount ? getChartAccountAccountTypeId(lineChartAccount) : "";

			if (!accountTypeId) {
				toast.error(`Account ${line.accountCode} type could not be resolved`);
				return;
			}

			details.push({
				chartOfAccountId: line.accountCode,
				accountTypeId,
				memo: line.memo.trim() || undefined,
				amount: line.amount,
				customerId: line.customerId,
				journalClassId: line.className || undefined,
			});
		}

		const payload: CreateCashTransactionRequest = {
			refNo: values.refNo.trim(),
			type: ACCOUNTING_TRANSACTION_TYPE_TO_API[ACCOUNTING_FORM_TRANSACTION_TYPES.revenue],
			date: serializedDate,
			currencyId: values.currencyId,
			employeeId: values.employeeId,
			memo: values.memo.trim() || undefined,
			cashTransactionDetails: details,
		};

		try {
			loadingOverlay.show("Processing revenue... Please wait.");
			await createCashTransaction(payload);
			toast.success(ACCOUNTING_DRAFT_FORM_TEXT.revenue.successMessage);
			if (mode === "print") {
				const previewState = buildRevenuePreviewState({
					refNo: payload.refNo,
					date: serializedDate,
					formValues: values,
					employeeOptions,
					chartAccountLabels: new Map(chartAccounts.map((account) => [account.id, account.name])),
				});
				navigate("/dashboard/accounting/revenue-preview?paper=a5&orientation=landscape", {
					state: previewState,
				});
				return;
			}
			if (mode === "close") {
				navigate("/dashboard/accounting");
				return;
			}
			reset({
				refNo: generateRefNo("REV"),
				date: generateCashTransactionDateTime(),
				currencyId: defaultCurrencyId,
				employeeId: "",
				memo: "",
				details: [
					{
						id: generateId(),
						accountCode: "",
						memo: "",
						amount: 0,
						customerId: "",
						className: "",
					},
				],
			});
		} catch (error: unknown) {
			const message = error instanceof Error ? error.message : "Failed to reset form";
			toast.error(message);
		} finally {
			loadingOverlay.hide();
		}
	};

	return (
		<div className="flex h-full flex-col gap-4 p-3 md:p-4">
			<div className="flex items-center gap-3 pb-2">
				<BackButton onClick={() => navigate("/dashboard/accounting")} />
				<div className="flex items-center gap-2 text-slate-700">
					<span className="text-base font-semibold">{ACCOUNTING_DRAFT_FORM_TEXT.revenue.pageTitle}</span>
				</div>
			</div>

			<Card className="gap-0 py-0">
				<CardHeader className="justify-start border-b px-4 py-3">
					<CardTitle className="text-left text-base font-semibold text-slate-700">
						{ACCOUNTING_DRAFT_FORM_TEXT.revenue.cardTitle}
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4 px-4 py-4">
					<CashTransactionFormHeader
						form={form}
						employeeOptions={employeeOptions}
						currencyOptions={currencyOptions}
						isLoadingEmployees={isLoading}
						isLoadingCurrencies={isLoadingCurrencies}
						type="REV"
					/>

					<CashTransactionDetailsTable
						form={form}
						chartAccounts={chartAccounts}
						customerOptions={customerOptions}
						journalClassOptions={journalClassOptions}
						isLoading={isLoading}
					/>

					<div className="flex items-center justify-end gap-3">
						<Button asChild variant="outline" type="button">
							<Link to="/dashboard/accounting">Cancel</Link>
						</Button>
						<SplitButton
							variant="info"
							mainAction={{
								label: ACCOUNTING_DRAFT_FORM_TEXT.revenue.saveAndClose,
								onClick: () => void handleSubmit((values) => onFormSubmit(values, "close"))(),
								disabled: isSubmitting,
							}}
							options={[
								{
									label: ACCOUNTING_DRAFT_FORM_TEXT.revenue.saveAndNew,
									onClick: () => void handleSubmit((values) => onFormSubmit(values, "new"))(),
									disabled: isSubmitting,
								},
								{
									label: "Save & Print",
									onClick: () => void handleSubmit((values) => onFormSubmit(values, "print"))(),
									disabled: isSubmitting,
								},
							]}
						/>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
