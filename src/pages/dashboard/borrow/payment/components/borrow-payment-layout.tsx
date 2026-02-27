import type { ReactNode } from "react";
import { useNavigate } from "react-router";
import Icon from "@/core/components/icon/icon";
import { Button } from "@/core/ui/button";
import { Text } from "@/core/ui/typography";

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
					<Button size="sm" variant="outline" onClick={() => navigate("/dashboard/borrow")}>
						<Icon icon="mdi:arrow-left" />
					</Button>
					<Button size="sm" className="gap-1 pointer-events-none">
						Checkout Transaction
					</Button>
					<Text variant="body2" className="text-slate-400">
						Dashboard / Borrow / Checkout
					</Text>
				</div>
			</div>

			<div className="flex-1 min-h-0 overflow-auto space-y-6">{children}</div>
		</div>
	);
}
