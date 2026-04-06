import type { ReactNode } from "react";
import { cn } from "@/core/utils";

interface FormRowProps {
	label: string;
	required?: boolean;
	children: ReactNode;
	className?: string;
	error?: string;
}

export function FormRow({ label, required, children, className, error }: FormRowProps) {
	return (
		<div className={cn("space-y-1 py-1.5", className)}>
			<div className="flex items-center gap-4">
				<div className="w-24 lg:w-32 shrink-0 text-[13px] font-medium text-gray-500">
					{required && <span className="text-red-500 mr-1">*</span>}
					{label}
				</div>
				<div className="flex-1">{children}</div>
			</div>
			{error && (
				<div className="flex gap-4">
					<div className="w-24 lg:w-32 shrink-0" />
					<p className="text-[12px] text-rose-500 font-medium">{error}</p>
				</div>
			)}
		</div>
	);
}
