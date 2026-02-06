import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps, ReactNode } from "react";
import { type DefaultValues, type RegisterOptions, useForm, type ValidationRule } from "react-hook-form";
import { FormActions, FormProvider, FormSelect, FormSwitch, FormTextarea, FormTextField } from "@/core/components/form";
import { Text } from "@/core/ui/typography";
import { cn } from "@/core/utils";

const defaultFormVariants = cva("flex flex-col bg-white rounded-lg", {
	variants: {
		variant: {
			default: "p-4 border space-y-4 gap-4",
			compact: "space-y-2 gap-2",
			inline: "flex-row items-end",
			card: "p-6 shadow-md border space-y-4 gap-4",
		},
		size: {
			default: "",
			sm: "text-sm",
			lg: "text-base",
		},
	},
	defaultVariants: {
		variant: "default",
		size: "default",
	},
});

const formGridVariants = cva("gap-6", {
	variants: {
		columns: {
			1: "grid grid-cols-1",
			2: "grid grid-cols-1 md:grid-cols-2",
			3: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
		},
	},
	defaultVariants: {
		columns: 2,
	},
});

export type FormPrimitive = string | number | boolean | null | undefined;
export type FormObject = Record<string, FormPrimitive>;
export type FormValue = FormPrimitive | FormObject | FormObject[];
export type FormType = "text" | "number" | "select" | "switch" | "textarea" | "date" | "custom";

export type FormFieldConfig = {
	name: string;
	label: string;
	type: FormType;
	placeholder?: string;
	required?: boolean;
	options?: { label: string; value: string }[];
	defaultValue?: FormValue;
	helperText?: string;
	component?: ReactNode;
	className?: string;
	pattern?: ValidationRule<RegExp>;
	startAdornment?: ReactNode;
	endAdornment?: ReactNode;
};

export type DefaultFormData = Record<string, FormValue>;

export type DefaultFormProps<TFormData extends DefaultFormData = DefaultFormData> = VariantProps<
	typeof defaultFormVariants
> & {
	title: string;
	fields: FormFieldConfig[];
	onSubmit?: (data: TFormData) => Promise<void> | void;
	onCancel?: () => void;
	defaultValues?: TFormData;
	submitLabel?: string;
	cancelLabel?: string;
	className?: string;
	columns?: 1 | 2 | 3;
	showTitle?: boolean;
	inputVariant?: "default" | "filled" | "ghost";
	inputSize?: "sm" | "md" | "lg";
	disableWhenClean?: boolean;
	actionsVariant?: ComponentProps<typeof FormActions>["variant"];
};

export function DefaultForm<TFormData extends DefaultFormData = DefaultFormData>({
	title,
	fields,
	onSubmit,
	onCancel,
	defaultValues = {} as TFormData,
	submitLabel = "Save",
	cancelLabel = "Cancel",
	className,
	variant,
	size,
	columns = 2,
	showTitle = true,
	inputVariant = "default",
	inputSize = "md",
	disableWhenClean = false,
	actionsVariant,
}: DefaultFormProps<TFormData>) {
	const buildDefaultValues = (): DefaultValues<TFormData> => {
		const values: Record<string, any> = {};
		for (const field of fields) {
			const fallback = field.type === "custom" ? undefined : "";
			values[field.name] = defaultValues[field.name] ?? field.defaultValue ?? fallback;
		}
		return values as DefaultValues<TFormData>;
	};

	const methods = useForm<TFormData>({
		defaultValues: buildDefaultValues(),
		mode: "onBlur",
	});

	const handleFormSubmit = async (data: TFormData) => {
		await onSubmit?.(data);
	};

	const renderField = (field: FormFieldConfig) => {
		const rules: RegisterOptions = {
			required: field.required ? { value: true, message: `${field.label} is required` } : undefined,
			pattern: field.pattern,
		};

		// Base props for all form components
		const baseProps = {
			key: field.name,
			name: field.name,
			label: field.label,
			placeholder: field.placeholder,
			helperText: field.helperText,
			requiredMark: field.required,
			containerClassName: field.className,
			rules,
		};

		const textFieldProps = {
			...baseProps,
			startAdornment: field.startAdornment,
			endAdornment: field.endAdornment,
		};

		switch (field.type) {
			case "select":
				return <FormSelect {...baseProps} options={field.options || []} variant={inputVariant} size={inputSize} />;

			case "switch":
				return <FormSwitch {...baseProps} />;

			case "textarea":
				return <FormTextarea {...baseProps} variant={inputVariant} size={inputSize} />;

			case "date":
				return <FormTextField {...textFieldProps} type="date" variant={inputVariant} size={inputSize} />;

			case "custom":
				return (
					<div key={field.name} className={field.className}>
						{field.component}
					</div>
				);

			default:
				return (
					<FormTextField
						{...textFieldProps}
						type={field.type === "number" ? "number" : "text"}
						variant={inputVariant}
						size={inputSize}
					/>
				);
		}
	};

	return (
		<div className={cn(defaultFormVariants({ variant, size }), className)}>
			{showTitle && (
				<Text variant="subTitle1" className="font-semibold text-sky-600 border-b pb-2">
					{title}
				</Text>
			)}

			<FormProvider methods={methods} onSubmit={handleFormSubmit} className="space-y-4">
				<div className={formGridVariants({ columns })}>{fields.map(renderField)}</div>

				<FormActions
					submitLabel={submitLabel}
					cancelLabel={cancelLabel}
					onCancel={onCancel}
					disableWhenClean={disableWhenClean}
					variant={actionsVariant}
				/>
			</FormProvider>
		</div>
	);
}

export { defaultFormVariants };
