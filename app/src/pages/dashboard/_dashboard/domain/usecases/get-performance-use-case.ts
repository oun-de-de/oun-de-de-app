import { Right, type Either } from "@/types/either";
import { type FailureType } from "@/types/failure";
import execute from "@/utils/execute";
import performanceRepository, {
  type PerformanceRepository,
} from "../repositories/performance-repository";
import { PerformanceItem } from "../entities/performance";

/**
 * Use case for getting Performance list
 */
class GetPerformanceUseCase {
  constructor(private readonly _repository: PerformanceRepository) {}

  async getPerformance(): Promise<Either<FailureType, PerformanceItem[]>> {
    return execute(
      async () => {
        await new Promise((resolve) => setTimeout(resolve as () => void, 1000));
        const result = await this._repository.getPerformance();
        return Right(result);
      },
      {
        funcTitle: `${GetPerformanceUseCase.name}.getPerformance`,
        errorMessage: "Get Performance Error",
      }
    );
  }
}

const getPerformanceUseCase = new GetPerformanceUseCase(performanceRepository);

export default getPerformanceUseCase;
export { GetPerformanceUseCase };
