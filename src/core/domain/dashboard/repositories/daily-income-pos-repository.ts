import { DailyIncomePosApi, DailyIncomePosApiImpl } from "@/core/api/services/dashboardService";
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

// Export singleton instance
const dailyIncomePosRepository = new DailyIncomePosRepositoryImpl(new DailyIncomePosApiImpl());

export default dailyIncomePosRepository;
export { DailyIncomePosRepositoryImpl }