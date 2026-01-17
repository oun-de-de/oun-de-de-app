import type { DashboardApi } from "@/core/api/services/dashboardService";
import type { VendorSummaryItem } from "../entities/vendor-info";

/**
 * Repository interface for Vendor Info data
 */
export type VendorInfoRepository = {
	getVendorInfo(): Promise<VendorSummaryItem[]>;
};

/**
 * Repository implementation using dashboardService
 */
class VendorInfoRepositoryImpl implements VendorInfoRepository {
	constructor(private api: DashboardApi) {}

	async getVendorInfo(): Promise<VendorSummaryItem[]> {
		return this.api.getVendorInfo();
	}
}

export { VendorInfoRepositoryImpl };
