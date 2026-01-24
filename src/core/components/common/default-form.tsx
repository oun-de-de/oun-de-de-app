import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FormProvider, FormSelect, FormSwitch, FormTextarea, FormTextField } from "@/core/components/form";
import { Button } from "@/core/ui/button";
import { Text } from "@/core/ui/typography";
import { cn } from "@/core/utils";

const defaultFormVariants = cva("flex flex-col bg-white rounded-lg", {
	variants: {
		variant: {
			default: "gap-4 p-4 border space-y-4",
			compact: "gap-2 p-2 space-y-2",
			inline: "flex-row items-end gap-4",
			card: "gap-4 p-6 shadow-md border space-y-4",
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

const formGridVariants = cva("", {
	variants: {
		columns: {
			1: "grid grid-cols-1 gap-4",
			2: "grid grid-cols-1 md:grid-cols-2 gap-4",
			3: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",
		},
	},
	defaultVariants: {
		columns: 2,
	},
});

export type FormFieldConfig = {
	name: string;
	label: string;
	type: "text" | "number" | "select" | "switch" | "textarea";
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
}: DefaultFormProps) {
	const [loading, setLoading] = useState(false);

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
		setLoading(true);
		try {
			await onSubmit?.(data);
		} finally {
			setLoading(false);
		}
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

				<div className="flex justify-end gap-2 pt-4 border-t">
					<Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
						{cancelLabel}
					</Button>
					<Button type="submit" disabled={loading}>
						{loading && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
						{submitLabel}
					</Button>
				</div>
			</FormProvider>
		</div>
	);
}

export { defaultFormVariants };
