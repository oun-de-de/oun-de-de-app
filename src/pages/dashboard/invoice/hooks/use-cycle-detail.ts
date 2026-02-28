import { useQuery } from "@tanstack/react-query";
import cycleService from "@/core/api/services/cycle-service";

export function useCycleDetail(cycleId?: string | null) {
	return useQuery({
		queryKey: ["cycle-detail", cycleId],
		queryFn: () => cycleService.getCycle(cycleId ?? ""),
		enabled: !!cycleId,
	});
}
