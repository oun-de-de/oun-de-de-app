import { BackButton } from "@/core/components/common";
import { Text } from "@/core/ui/typography";
import type { ReactNode } from "react";
import { useNavigate } from "react-router";

interface BorrowPaymentLayoutProps {
	children: ReactNode;
}

export function BorrowPaymentLayout({ children }: BorrowPaymentLayoutProps) {
	const navigate = useNavigate();

	return (
		<div className="flex h-full flex-col gap-6 p-6">
			{/* Header */}
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div className="flex items-center gap-2">
					<BackButton appearance="icon" onClick={() => navigate("/dashboard/loan")} />
					<Text variant="body2" className="text-slate-500">
						Create Loan
					</Text>
				</div>
			</div>

			<div className="flex-1 min-h-0 overflow-auto space-y-6">{children}</div>
		</div>
	);
}
