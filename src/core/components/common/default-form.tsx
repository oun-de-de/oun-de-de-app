import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { useForm } from "react-hook-form";
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

export type FormFieldConfig = {
	name: string;
	label: string;
	type: "text" | "number" | "select" | "switch" | "textarea" | "date";
	placeholder?: string;
	required?: boolean;
	options?: { label: string; value: string }[];
	defaultValue?: string | number | boolean;
	helperText?: string;
};

export type DefaultFormData = Record<string, string | number | boolean>;

export type DefaultFormProps = VariantProps<typeof defaultFormVariants> & {
	title: string;
	fields: FormFieldConfig[];
	onSubmit?: (data: DefaultFormData) => Promise<void> | void;
	onCancel?: () => void;
	defaultValues?: DefaultFormData;
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

export function DefaultForm({
	title,
	fields,
	onSubmit,
	onCancel,
	defaultValues = {},
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
}: DefaultFormProps) {
	const buildDefaultValues = () => {
		const values: DefaultFormData = {};
		for (const field of fields) {
			values[field.name] = defaultValues[field.name] ?? field.defaultValue ?? "";
		}
		return values;
	};

	const methods = useForm<DefaultFormData>({
		defaultValues: buildDefaultValues(),
	});

	const handleFormSubmit = async (data: DefaultFormData) => {
		await onSubmit?.(data);
	};

	const renderField = (field: FormFieldConfig) => {
		const commonProps = {
			key: field.name,
			name: field.name,
			label: field.label,
			placeholder: field.placeholder,
			helperText: field.helperText,
			requiredMark: field.required,
		};

		switch (field.type) {
			case "select":
				return <FormSelect {...commonProps} options={field.options || []} variant={inputVariant} size={inputSize} />;

			case "switch":
				return <FormSwitch {...commonProps} />;

			case "textarea":
				return <FormTextarea {...commonProps} variant={inputVariant} size={inputSize} />;

			case "date":
				return <FormTextField {...commonProps} type="date" variant={inputVariant} size={inputSize} />;

			default:
				return (
					<FormTextField
						{...commonProps}
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
