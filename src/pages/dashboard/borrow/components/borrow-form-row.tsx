import type { ReactNode } from "react";
import { cn } from "@/core/utils";

interface FormRowProps {
	label: string;
	required?: boolean;
	children: ReactNode;
	className?: string;
}

export function FormRow({ label, required, children, className }: FormRowProps) {
	return (
		<div className={cn("flex items-center gap-4 py-1.5", className)}>
			<div className="w-24 lg:w-32 shrink-0 text-[13px] font-medium text-gray-500">
				{required && <span className="text-red-500 mr-1">*</span>}
				{label}
			</div>
			<div className="flex-1">{children}</div>
		</div>
	);
}
