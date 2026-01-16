import { DailyIncomePosApi } from "@/core/api/services/dashboardService";
import { DailyIncomePos } from "../entities/daily-income";

/**
 * Repository interface for Daily Income POS data
 */
export type DailyIncomePosRepository = {
	getDailyIncomePos(range: string): Promise<DailyIncomePos[]>;
};

/**
 * Repository implementation using dashboardService
 */
class DailyIncomePosRepositoryImpl implements DailyIncomePosRepository {
	constructor(private api: DailyIncomePosApi) {}

	async getDailyIncomePos(range: string): Promise<DailyIncomePos[]> {
		return this.api.getDailyIncomesPos(range);
	}
}

export { DailyIncomePosRepositoryImpl };
