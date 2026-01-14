import dashboardService from "@/api/services/dashboardService";
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
  async getPerformance(): Promise<PerformanceItem[]> {
    return dashboardService.getPerformance();
  }
}

// Export singleton instance
const performanceRepository = new PerformanceRepositoryImpl();

export default performanceRepository;
export { PerformanceRepositoryImpl };
