import { Left, Right, type Either } from "@/core/interfaces/either";
import { Failure, type FailureType } from "@/core/types/failure";
import execute from "@/core/utils/execute";
import { DailyIncomeAccounting } from "../entities/daily-income";
import { FilterData } from "../entities/filter";
import { DailyIncomeAccountingRepository } from "../repositories/daily-income-accounting-repository";

/**
 * Use case for getting Daily Income POS list
 */
class GetIncomeAccountingListUseCase {
	constructor(private readonly _repository: DailyIncomeAccountingRepository) {}

	async getIncomeAccountingList(filter?: FilterData): Promise<Either<FailureType, DailyIncomeAccounting[]>> {
		return execute(
			async () => {
				if (!filter?.id) {
					return Left(Failure("Filter ID not found"));
				}

				const result = await this._repository.getDailyIncomeAccounting(filter?.id);
				return Right(result);
			},
			{
				funcTitle: `${GetIncomeAccountingListUseCase.name}.getIncomeAccountingList`,
				errorMessage: "Failed to get income pos list",
			},
		);
	}
}

export { GetIncomeAccountingListUseCase };
