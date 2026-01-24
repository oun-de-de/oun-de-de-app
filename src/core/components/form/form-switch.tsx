import type React from "react";
import { Controller, useFormContext } from "react-hook-form";
import { Switch } from "@/core/ui/switch";
import { cn } from "@/core/utils";
import { FormField } from "./form-field";

type FormSwitchProps = {
	name: string;
	label?: React.ReactNode;
	helperText?: React.ReactNode;
	containerClassName?: string;
	switchClassName?: string;
	disabled?: boolean;
};

export function FormSwitch({
	name,
	label,
	helperText,
	containerClassName,
	switchClassName,
	disabled,
}: FormSwitchProps) {
	const { control } = useFormContext();

	return (
		<FormField name={name} helperText={helperText} containerClassName={containerClassName}>
			{() => (
				<div className="flex items-center gap-2">
					<Controller
						name={name}
						control={control}
						render={({ field }) => (
							<Switch
								id={name}
								checked={field.value}
								onCheckedChange={field.onChange}
								disabled={disabled}
								className={cn(switchClassName)}
							/>
						)}
					/>
					{label && (
						<label htmlFor={name} className="text-sm font-medium cursor-pointer">
							{label}
						</label>
					)}
				</div>
			)}
		</FormField>
	);
}
