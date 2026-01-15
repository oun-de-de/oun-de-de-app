
import { DashboardApi, DashboardApiImpl } from "@/api/services/dashboardService";
import { CustomerSummaryItem } from "../entities/customer-info";

/**
 * Repository interface for Customer Info data
 */
export type CustomerInfoRepository = {
  getCustomerInfo(): Promise<CustomerSummaryItem[]>;
};

/**
 * Repository implementation using dashboardService
 */
class CustomerInfoRepositoryImpl implements CustomerInfoRepository {
  constructor(private api: DashboardApi) {}

  async getCustomerInfo(): Promise<CustomerSummaryItem[]> {
    return this.api.getCustomerInfo();
  }
}

// Export singleton instance
const customerInfoRepository = new CustomerInfoRepositoryImpl(new DashboardApiImpl());

export default customerInfoRepository;
export { CustomerInfoRepositoryImpl };
