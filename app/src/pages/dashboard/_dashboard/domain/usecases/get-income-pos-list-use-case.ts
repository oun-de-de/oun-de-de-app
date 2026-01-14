import { Left, Right, type Either } from "@/types/either";
import { Failure, type FailureType } from "@/types/failure";
import execute from "@/utils/execute";
import dailyIncomePosRepository, { DailyIncomePosRepository } from "../repositories/daily-income-pos-repository";
import { DailyIncomePoint } from "../entities/daily-income-point";

/**
 * Use case for getting Daily Income POS list
 */
class GetIncomePosListUseCase {
  constructor(private readonly _repository: DailyIncomePosRepository) {}

  async getIncomePosList(
    id?: "7" | "15" | "30"
  ): Promise<Either<FailureType, DailyIncomePoint[]>> {
    return execute(
      async () => {
        await new Promise((resolve) => setTimeout(resolve as () => void, 1000));
        if(!id) {
          return Left(Failure('Filter ID not found'));
        }

        const result = await this._repository.getDailyIncomePos(id);
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
