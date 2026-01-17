import { Right, type Either } from "@/core/types/either";
import type { FailureType } from "@/core/types/failure";
import execute from "@/core/utils/execute";
import type { VendorSummaryItem } from "../entities/vendor-info";
import type { VendorInfoRepository } from "../repositories/vendor-info-repository";

export class GetVendorInfoUseCase {
	constructor(private readonly _repository: VendorInfoRepository) {}

	async getVendorInfo(): Promise<Either<FailureType, VendorSummaryItem[]>> {
		return execute(
			async () => {
				const result = await this._repository.getVendorInfo();
				return Right(result);
			},
			{
				funcTitle: `${GetVendorInfoUseCase.name}.getVendorInfo`,
				errorMessage: "Failed to get vendor info",
			},
		);
	}
}
