import type React from "react";
import { useFormContext } from "react-hook-form";
import { cn } from "@/core/utils";
import { FormField } from "./form-field";
import { textareaVariants } from "./styles/variants";

type FormTextareaProps = {
	name: string;
	label?: React.ReactNode;
	helperText?: React.ReactNode;
	requiredMark?: boolean;
	variant?: "default" | "filled" | "ghost";
	size?: "sm" | "md" | "lg";
	containerClassName?: string;
	textAreaClassName?: string;
	textAreaProps?: React.TextareaHTMLAttributes<HTMLTextAreaElement>;
	placeholder?: string;
	disabled?: boolean;
	rows?: number;
};

export function FormTextarea({
	name,
	label,
	helperText,
	requiredMark,
	variant = "default",
	size = "md",
	containerClassName,
	textAreaClassName,
	textAreaProps,
	placeholder,
	disabled,
	rows = 3,
}: FormTextareaProps) {
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
				<textarea
					{...register(name)}
					placeholder={placeholder}
					disabled={disabled}
					rows={rows}
					{...textAreaProps}
					className={cn(textareaVariants({ variant, size, state: error ? "error" : "normal" }), textAreaClassName)}
				/>
			)}
		</FormField>
	);
}
