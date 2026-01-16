import { DailyIncomeAccountingApi } from "@/core/api/services/dashboardService";
import { DailyIncomeAccounting } from "../entities/daily-income";

/**
 * Repository interface for Daily Income POS data
 */
export type DailyIncomeAccountingRepository = {
	getDailyIncomeAccounting(range: string): Promise<DailyIncomeAccounting[]>;
};

/**
 * Repository implementation using dashboardService
 */
class DailyIncomeAccountingRepositoryImpl implements DailyIncomeAccountingRepository {
	constructor(private api: DailyIncomeAccountingApi) {}

	async getDailyIncomeAccounting(range: string): Promise<DailyIncomeAccounting[]> {
		return this.api.getDailyIncomesAccounting(range);
	}
}

export { DailyIncomeAccountingRepositoryImpl };
