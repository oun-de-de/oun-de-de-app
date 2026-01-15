import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/ui/dropdown-menu";
import { PromiseBuilder } from "@/ui/promise-builder";
import { ChevronDownIcon } from "lucide-react";
import { DashboardRepository } from "../../../domain/repositories/dashboard-repository";
import { useProvider } from "@/ui/multi-provider";
import { useObservable } from "react-use";
import { FilterData } from "../../../domain/entities/filter";

export default function DashboardDropdownMenu() {
	const repo = useProvider<DashboardRepository>();

  return (
    <PromiseBuilder
      promise={repo.getFiltersByType('income-pos')}
      builder={(snapshot) => {
        if (
          snapshot.connectionState === "none" ||
          snapshot.connectionState === "waiting"
        ) {
          return (
            <button className="inline-flex h-9 items-center rounded border px-3 text-sm text-gray-400">
              Loading...
            </button>
          );
        }

        if (snapshot.connectionState === "done" && snapshot.error) {
          return (
            <button className="inline-flex h-9 items-center rounded border px-3 text-sm text-red-500">
              Error
            </button>
          );
        }

        const items = snapshot.data ?? [];
        if (!items.length) {
          return (
            <button className="inline-flex h-9 items-center rounded border px-3 text-sm text-gray-400">
              No data
            </button>
          );
        }

        return (
          <_DropdownMenu items={items} />
        );
      }}
    />
  );
}

function _DropdownMenu({ items }: { items: FilterData[] }) {
  const repo = useProvider<DashboardRepository>();

  const selectedValue = useObservable(
    repo.selectedFilter$,
    repo.getSelectedFilter()
  );
  return (
    <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <button className="group inline-flex h-9 items-center gap-1 rounded border border-gray-300 bg-white px-3 text-sm font-medium">
        <span className="text-gray-500">{selectedValue?.value}</span>
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