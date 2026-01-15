import { Left, Right, type Either } from "@/types/either";
import { Failure, type FailureType } from "@/types/failure";
import execute from "@/utils/execute";
import dailyIncomePosRepository, { DailyIncomePosRepository } from "../repositories/daily-income-pos-repository";
import { DailyIncomePos } from "../entities/daily-income";
import { FilterData } from "../entities/filter";

/**
 * Use case for getting Daily Income POS list
 */
class GetIncomePosListUseCase {
  constructor(private readonly _repository: DailyIncomePosRepository) {}

  async getIncomePosList(
    filter?: FilterData
  ): Promise<Either<FailureType, DailyIncomePos[]>> {
    return execute(
      async () => {
        await new Promise((resolve) => setTimeout(resolve as () => void, 1000));
        if(!filter?.id) {
          return Left(Failure('Filter ID not found'));
        }

        const result = await this._repository.getDailyIncomePos(filter?.id);
        return Right(result);
      },
      {
        funcTitle: `${GetIncomePosListUseCase.name}.getIncomePosList`,
        errorMessage: "Failed to get income pos list",
      }
    );
  }
}

const getIncomePosListUseCase = new GetIncomePosListUseCase(dailyIncomePosRepository);

export default getIncomePosListUseCase;
export { GetIncomePosListUseCase };
