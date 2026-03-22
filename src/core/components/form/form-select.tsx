import type React from "react";
import { Controller, type RegisterOptions, useFormContext } from "react-hook-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/ui/select";
import { cn } from "@/core/utils";
import { FormField } from "./form-field";
import { selectVariants } from "./styles/variants";

type Option = { label: string; value: string; disabled?: boolean };

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
	selectProps?: React.ComponentPropsWithoutRef<typeof Select>;
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
	const { control } = useFormContext();

	return (
		<FormField
			name={name}
			label={label}
			helperText={helperText}
			requiredMark={requiredMark}
			containerClassName={containerClassName}
		>
			{({ error }) => (
				<Controller
					name={name}
					control={control}
					rules={rules}
					render={({ field }) => (
						<Select
							name={field.name}
							value={field.value}
							onValueChange={field.onChange}
							disabled={disabled}
							{...selectProps}
						>
							<SelectTrigger
								ref={field.ref}
								className={cn(selectVariants({ variant, size, state: error ? "error" : "normal" }), selectClassName)}
								aria-invalid={!!error}
								data-testid={`${name}-select`}
								onBlur={field.onBlur}
							>
								<SelectValue placeholder={placeholder} />
							</SelectTrigger>
							<SelectContent>
								{options.map((o) => (
									<SelectItem key={o.value} value={o.value} disabled={o.disabled}>
										{o.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					)}
				/>
			)}
		</FormField>
	);
}
