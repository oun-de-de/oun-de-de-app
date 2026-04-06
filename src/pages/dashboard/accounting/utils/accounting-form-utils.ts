import { z } from "zod";
import { formatDateTimeLocalInputValue } from "./format-local-date-time";

export const generateId = () =>
	typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `line-${Date.now()}-${Math.random()}`;

export const generateRefNo = (prefix: "REV" | "EXP" = "REV") => `${prefix}-${Date.now().toString().slice(-8)}`;

export const generateCashTransactionDateTime = () => formatDateTimeLocalInputValue();

export const getChartAccountLabel = (code?: string, name?: string) => (code && name ? `${code} : ${name}` : "");

export const cashTransactionLineSchema = z.object({
	id: z.string(),
	accountCode: z.string().trim().min(1, "Account is required"),
	memo: z.string(),
	amount: z.coerce.number().positive("Amount must be greater than 0"),
	customerId: z.string().trim().min(1, "Customer name is required"),
	className: z.string().optional(),
});

export const cashTransactionFormSchema = z.object({
	refNo: z.string().trim().min(1, "Ref No is required"),
	date: z.string().min(1, "Date is required"),
	currencyId: z.string().min(1, "Currency is required"),
	employeeId: z.string().min(1, "Employee is required"),
	memo: z.string(),
	details: z.array(cashTransactionLineSchema).min(1, "At least one line is required"),
});

export type CashTransactionFormValues = z.infer<typeof cashTransactionFormSchema>;
