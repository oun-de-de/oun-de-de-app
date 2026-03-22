import type React from "react";
import { cn } from "@/core/utils";

interface ReportLayoutProps {
	children: React.ReactNode;
	className?: string;
}

export function ReportLayout({ children, className }: ReportLayoutProps) {
	return (
		<div
			className={cn(
				"flex w-full flex-col gap-4 overflow-auto p-4 print:block print:overflow-visible print:gap-0 print:p-0",
				className,
			)}
		>
			{children}
		</div>
	);
}
