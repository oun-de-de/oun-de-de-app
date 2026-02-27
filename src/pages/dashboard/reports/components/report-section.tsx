import Icon from "@/core/components/icon/icon";
import { Button } from "@/core/ui/button";
import { Card, CardContent } from "@/core/ui/card";
import { Text } from "@/core/ui/typography";
import { cn } from "@/core/utils";
import { ReportItem } from "./report-item";

export interface ReportSectionData {
	title: string;
	icon: string;
	items: { slug: string; label: string }[];
}

interface ReportSectionProps {
	section: ReportSectionData;
	favorites: string[];
	onToggleFavorite: (slug: string) => void;
	className?: string;
}

export function ReportSection({ section, favorites, onToggleFavorite, className }: ReportSectionProps) {
	return (
		<Card className={cn("w-full", className)}>
			<CardContent className="flex flex-col gap-4 p-4">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Icon icon={section.icon} className="text-sky-600" />
						<Text variant="body2" className="font-semibold text-slate-500">
							{section.title}
						</Text>
					</div>
					<Button variant="ghost" size="icon" className="h-7 w-7">
						<Icon icon="mdi:chevron-down" />
					</Button>
				</div>
				<div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
					{section.items.map((item) => (
						<ReportItem
							key={item.slug}
							slug={item.slug}
							label={item.label}
							isFavorite={favorites.includes(item.slug) || favorites.includes(item.label)}
							onToggleFavorite={onToggleFavorite}
						/>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
