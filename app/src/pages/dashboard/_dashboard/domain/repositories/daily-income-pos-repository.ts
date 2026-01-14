import dashboardService from "@/api/services/dashboardService";
import { DailyIncomePoint } from "../entities/daily-income-point";

/**
 * Repository interface for Daily Income POS data
 */
export type DailyIncomePosRepository = {
    getDailyIncomePos(range: string): Promise<DailyIncomePoint[]>;
};
  
  /**
   * Repository implementation using dashboardService
   */
class DailyIncomePosRepositoryImpl implements DailyIncomePosRepository {
async getDailyIncomePos(range: string): Promise<DailyIncomePoint[]> {
    return dashboardService.getDailyIncomePos(range);
}
}

// Export singleton instance
const dailyIncomePosRepository = new DailyIncomePosRepositoryImpl();

export default dailyIncomePosRepository;
export { DailyIncomePosRepositoryImpl }