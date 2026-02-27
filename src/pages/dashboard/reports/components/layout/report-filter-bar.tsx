import type React from "react";
import { useState } from "react";
import Icon from "@/core/components/icon/icon";
import { Button } from "@/core/ui/button";
import { Card, CardContent } from "@/core/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/core/ui/collapsible";
import { Text } from "@/core/ui/typography";
import { cn } from "@/core/utils";

interface ReportFilterBarProps {
	title: string;
	icon: string;
	children: React.ReactNode;
	defaultOpen?: boolean;
	className?: string;
}

export function ReportFilterBar({ title, icon, children, defaultOpen = true, className }: ReportFilterBarProps) {
	const [isOpen, setIsOpen] = useState(defaultOpen);

	return (
		<Card className={cn("w-full transition-all duration-200", className)}>
			<Collapsible open={isOpen} onOpenChange={setIsOpen}>
				<CardContent className="flex flex-col gap-4 p-2 md:p-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<Icon icon={icon} className="text-sky-600" />
							<Text variant="body2" className="font-semibold text-slate-500">
								{title}
							</Text>
						</div>
						<CollapsibleTrigger asChild>
							<Button variant="ghost" size="icon" className="h-7 w-7">
								<Icon
									icon="mdi:chevron-down"
									className={cn("transition-transform duration-200", !isOpen && "-rotate-90")}
								/>
							</Button>
						</CollapsibleTrigger>
					</div>
					<CollapsibleContent>
						<div className="pt-2">{children}</div>
					</CollapsibleContent>
				</CardContent>
			</Collapsible>
		</Card>
	);
}
