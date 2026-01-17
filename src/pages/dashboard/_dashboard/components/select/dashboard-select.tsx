import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/ui/select";
import { DashboardRepository } from "../../../../../core/domain/dashboard/repositories/dashboard-repository";
import { useObservable } from "react-use";
import { FilterData } from "../../../../../core/domain/dashboard/entities/filter";

type Props = {
	items: FilterData[];
	repo: DashboardRepository;
};

export default function DashboardSelect({ items, repo }: Props) {
	const selectedValue = useObservable(repo.selectedFilter$, repo.getSelectedFilter());

	return (
		<Select
			value={selectedValue?.id}
			onValueChange={(id) => {
				const item = items.find((it) => it.id === id);
				if (item) repo.selectFilter(item);
			}}
		>
			<SelectTrigger>
				<SelectValue />
			</SelectTrigger>

			<SelectContent align="end">
				{items.map((item) => (
					<SelectItem key={item.id} value={item.id}>
						{item.value}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
