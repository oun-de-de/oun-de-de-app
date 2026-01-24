import type React from "react";
import { type FieldValues, FormProvider as RHFProvider, type SubmitHandler, type UseFormReturn } from "react-hook-form";
import { cn } from "@/core/utils";

type FormProviderProps<T extends FieldValues> = {
	methods: UseFormReturn<T>;
	onSubmit: SubmitHandler<T>;
	children: React.ReactNode;
	className?: string;
};

export function FormProvider<T extends FieldValues>({ methods, onSubmit, children, className }: FormProviderProps<T>) {
	return (
		<RHFProvider {...methods}>
			<form className={cn("space-y-4", className)} onSubmit={methods.handleSubmit(onSubmit)}>
				{children}
			</form>
		</RHFProvider>
	);
}
