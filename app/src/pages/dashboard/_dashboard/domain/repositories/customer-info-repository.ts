import dashboardService from "@/api/services/dashboardService";
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
  async getCustomerInfo(): Promise<CustomerSummaryItem[]> {
    return dashboardService.getCustomerInfo();
  }
}

// Export singleton instance
const customerInfoRepository = new CustomerInfoRepositoryImpl();

export default customerInfoRepository;
export { CustomerInfoRepositoryImpl };
