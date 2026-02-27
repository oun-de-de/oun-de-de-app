import type React from "react";
import { cn } from "@/core/utils";

interface ReportLayoutProps {
	children: React.ReactNode;
	className?: string;
}

export function ReportLayout({ children, className }: ReportLayoutProps) {
	return <div className={cn("flex w-full flex-col gap-4 p-4 overflow-auto", className)}>{children}</div>;
}
