import { Right, type Either } from "@/core/types/either";
import { type FailureType } from "@/core/types/failure";
import execute from "@/core/utils/execute";
import { type PerformanceRepository } from "../repositories/performance-repository";
import { PerformanceItem } from "../entities/performance";

/**
 * Use case for getting Performance list
 */
class GetPerformanceUseCase {
	constructor(private readonly _repository: PerformanceRepository) {}

	async getPerformance(): Promise<Either<FailureType, PerformanceItem[]>> {
		return execute(
			async () => {
				const result = await this._repository.getPerformance();
				return Right(result);
			},
			{
				funcTitle: `${GetPerformanceUseCase.name}.getPerformance`,
				errorMessage: "Get Performance Error",
			},
		);
	}
}

export { GetPerformanceUseCase };
