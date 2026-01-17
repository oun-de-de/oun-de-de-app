import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
} from "@/core/ui/dropdown-menu";
import { Button } from "@/core/ui/button";
import { ChevronDownIcon } from "lucide-react";
import { DashboardRepository } from "../../../../../core/domain/dashboard/repositories/dashboard-repository";
import { useObservable } from "react-use";
import { FilterData } from "../../../../../core/domain/dashboard/entities/filter";

type Props = {
	items: FilterData[];
	repo: DashboardRepository;
};

export default function DashboardDropdownMenu({ items, repo }: Props) {
	const selectedValue = useObservable(repo.selectedFilter$, repo.getSelectedFilter());

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline" className="group h-9 gap-1">
					<span className="overflow-hidden text-ellipsis whitespace-nowrap">{selectedValue?.value}</span>
					<ChevronDownIcon className="size-4 transition-transform group-data-[state=open]:rotate-180" />
				</Button>
			</DropdownMenuTrigger>

			<DropdownMenuContent align="end">
				<DropdownMenuRadioGroup
					value={selectedValue?.id}
					onValueChange={(id) => {
						const item = items.find((it) => it.id === id);
						if (item) repo.selectFilter(item);
					}}
				>
					{items.map((item) => (
						<DropdownMenuRadioItem key={item.id} value={item.id}>
							{item.value}
						</DropdownMenuRadioItem>
					))}
				</DropdownMenuRadioGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
