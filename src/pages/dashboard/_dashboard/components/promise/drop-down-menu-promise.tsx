import { PromiseBuilder } from "@/core/ui/promise-builder";
import { FilterData } from "../../../../../core/domain/dashboard/entities/filter";
import { DashboardRepository } from "../../../../../core/domain/dashboard/repositories/dashboard-repository";
import Repository from "@/service-locator";
import { useCallback } from "react";

type Props = {
	repoName: string;
	builder: (items: FilterData[], repo: DashboardRepository) => React.ReactNode;
};

export default function DropdownMenuPromise({ repoName, builder }: Props) {
	const repo = Repository.get<DashboardRepository>(repoName);

	const promise = useCallback(() => repo.getFiltersByType("income-pos"), [repo]);

	return (
		<PromiseBuilder
			promise={promise}
			builder={(snapshot) => {
				if (snapshot.connectionState === "none" || snapshot.connectionState === "waiting") {
					return (
						<button className="inline-flex h-9 items-center rounded border px-3 text-sm text-gray-400">
							Loading...
						</button>
					);
				}

				if (snapshot.connectionState === "done" && snapshot.error) {
					return (
						<button className="inline-flex h-9 items-center rounded border px-3 text-sm text-red-500">Error</button>
					);
				}

				const items = snapshot.data ?? [];
				if (!items.length) {
					return (
						<button className="inline-flex h-9 items-center rounded border px-3 text-sm text-gray-400">No data</button>
					);
				}

				return builder(items, repo);
			}}
		/>
	);
}
