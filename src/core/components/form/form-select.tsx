import type React from "react";
import { type RegisterOptions, useFormContext } from "react-hook-form";
import { cn } from "@/core/utils";
import { FormField } from "./form-field";
import { selectVariants } from "./styles/variants";

type Option = { label: string; value: string };

type FormSelectProps = {
	name: string;
	label?: React.ReactNode;
	helperText?: React.ReactNode;
	requiredMark?: boolean;
	variant?: "default" | "filled" | "ghost";
	size?: "sm" | "md" | "lg";
	options: Option[];
	containerClassName?: string;
	selectClassName?: string;
	selectProps?: React.SelectHTMLAttributes<HTMLSelectElement>;
	placeholder?: string;
	disabled?: boolean;
	rules?: RegisterOptions;
};

export function FormSelect({
	name,
	label,
	helperText,
	requiredMark,
	variant = "default",
	size = "md",
	options,
	containerClassName,
	selectClassName,
	selectProps,
	placeholder,
	disabled,
	rules,
}: FormSelectProps) {
	const { register } = useFormContext();

	return (
		<FormField
			name={name}
			label={label}
			helperText={helperText}
			requiredMark={requiredMark}
			containerClassName={containerClassName}
		>
			{({ error }) => (
				<select
					{...register(name, rules)}
					disabled={disabled}
					{...selectProps}
					className={cn(selectVariants({ variant, size, state: error ? "error" : "normal" }), selectClassName)}
				>
					{placeholder && (
						<option value="" disabled>
							{placeholder}
						</option>
					)}
					{options.map((o) => (
						<option key={o.value} value={o.value}>
							{o.label}
						</option>
					))}
				</select>
			)}
		</FormField>
	);
}
