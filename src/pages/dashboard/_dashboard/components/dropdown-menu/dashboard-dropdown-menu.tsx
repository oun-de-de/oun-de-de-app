import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/core/ui/dropdown-menu";
import { ChevronDownIcon } from "lucide-react";
import { DashboardRepository } from "../../../../../core/domain/dashboard/repositories/dashboard-repository";
import { useObservable } from "react-use";
import { FilterData } from "../../../../../core/domain/dashboard/entities/filter";

type Props = {
  items: FilterData[];
  repo: DashboardRepository;
};

export default function DashboardDropdownMenu({ items, repo }: Props) {
  const selectedValue = useObservable(
    repo.selectedFilter$,
    repo.getSelectedFilter(),
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="group inline-flex h-9 items-center gap-1 rounded border border-gray-300 bg-white px-3 text-sm font-medium">
          <span className="text-gray-500 overflow-hidden text-ellipsis whitespace-nowrap">
            {selectedValue?.value}
          </span>
          <ChevronDownIcon className="size-4 transition-transform group-data-[state=open]:rotate-180 text-gray-500" />
        </button>
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