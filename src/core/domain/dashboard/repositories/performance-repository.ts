import { DashboardApi } from "@/core/api/services/dashboardService";
import { PerformanceItem } from "../entities/performance";

/**
 * Repository interface for Performance data
 */
export type PerformanceRepository = {
	getPerformance(): Promise<PerformanceItem[]>;
};

/**
 * Repository implementation using dashboardService
 */
class PerformanceRepositoryImpl implements PerformanceRepository {
	constructor(private api: DashboardApi) {}

	async getPerformance(): Promise<PerformanceItem[]> {
		return this.api.getPerformance();
	}
}

export { PerformanceRepositoryImpl };
