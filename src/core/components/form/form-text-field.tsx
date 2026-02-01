import type React from "react";
import { type RegisterOptions, useFormContext } from "react-hook-form";
import { cn } from "@/core/utils";
import { FormField } from "./form-field";
import { inputVariants } from "./styles/variants";

type FormTextFieldProps = {
	name: string;
	label?: React.ReactNode;
	helperText?: React.ReactNode;
	requiredMark?: boolean;
	variant?: "default" | "filled" | "ghost";
	size?: "sm" | "md" | "lg";
	startAdornment?: React.ReactNode;
	endAdornment?: React.ReactNode;
	containerClassName?: string;
	inputClassName?: string;
	inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
	type?: React.HTMLInputTypeAttribute;
	placeholder?: string;
	disabled?: boolean;
	rules?: RegisterOptions;
};

export function FormTextField({
	name,
	label,
	helperText,
	requiredMark,
	variant = "default",
	size = "md",
	startAdornment,
	endAdornment,
	containerClassName,
	inputClassName,
	inputProps,
	type = "text",
	placeholder,
	disabled,
	rules,
}: FormTextFieldProps) {
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
				<div className="flex items-center gap-2">
					{startAdornment}
					<input
						{...register(name, rules)}
						type={type}
						placeholder={placeholder}
						disabled={disabled}
						{...inputProps}
						className={cn(inputVariants({ variant, size, state: error ? "error" : "normal" }), inputClassName)}
					/>
					{endAdornment}
				</div>
			)}
		</FormField>
	);
}
