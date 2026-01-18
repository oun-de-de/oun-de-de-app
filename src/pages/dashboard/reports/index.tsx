import { reportSections, reportTabs } from "@/_mock/data/dashboard";
import Icon from "@/core/components/icon/icon";
import { Button } from "@/core/ui/button";
import { Card, CardContent } from "@/core/ui/card";
import { Text } from "@/core/ui/typography";

export default function ReportsPage() {
	return (
		<div className="flex w-full flex-col gap-4">
			<Card>
				<CardContent className="flex flex-wrap items-center gap-2 p-4">
					{reportTabs.map((tab, index) => (
						<Button key={tab} variant={index === 0 ? "default" : "ghost"} size="sm" className="gap-1">
							<Icon icon="mdi:account-outline" />
							{tab}
						</Button>
					))}
				</CardContent>
			</Card>

			{reportSections.map((section) => (
				<Card key={section.title}>
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
								<div key={item.label} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
									<span className="text-slate-500">{item.label}</span>
									<Icon
										icon={item.favorite ? "mdi:star" : "mdi:star-outline"}
										size={"1.2em"}
										className={item.favorite ? "text-sky-500" : "text-slate-500"}
									/>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	);
}
