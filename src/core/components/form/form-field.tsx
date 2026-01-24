import type React from "react";
import { useFormContext } from "react-hook-form";
import { cn } from "@/core/utils";
import { formTokens } from "./styles/tokens";

type FormFieldProps = {
	name: string;
	label?: React.ReactNode;
	helperText?: React.ReactNode;
	requiredMark?: boolean;
	containerClassName?: string;
	labelClassName?: string;
	helperClassName?: string;
	errorClassName?: string;
	children: (params: { error?: string }) => React.ReactNode;
};

export function FormField({
	name,
	label,
	helperText,
	requiredMark,
	containerClassName,
	labelClassName,
	helperClassName,
	errorClassName,
	children,
}: FormFieldProps) {
	const {
		formState: { errors },
	} = useFormContext();

	const err = errors?.[name]?.message as string | undefined;

	return (
		<div className={cn(formTokens.field, containerClassName)}>
			{label && (
				<div className={cn(formTokens.label, labelClassName)}>
					{label} {requiredMark ? <span className="text-destructive">*</span> : null}
				</div>
			)}

			{children({ error: err })}

			{!err && helperText ? <div className={cn(formTokens.helper, helperClassName)}>{helperText}</div> : null}

			{err ? <div className={cn(formTokens.error, errorClassName)}>{err}</div> : null}
		</div>
	);
}
