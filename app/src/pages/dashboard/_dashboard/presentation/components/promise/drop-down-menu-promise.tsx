import { PromiseBuilder } from "@/ui/promise-builder";
import { FilterData } from "../../../domain/entities/filter";
import { DashboardRepository } from "../../../domain/repositories/dashboard-repository";

type Props = {
    repo: DashboardRepository;
    builder: (items: FilterData[], repo: DashboardRepository) => React.ReactNode;
  };

export default function DropdownMenuPromise({ repo, builder }: Props) {
    return (
        <PromiseBuilder
        promise={repo.getFiltersByType("income-pos")}
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
            
            return builder(items, repo);
        }}
        />
    );
}
