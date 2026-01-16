import { Right, type Either } from "@/core/types/either";
import { type FailureType } from "@/core/types/failure";
import execute from "@/core/utils/execute";
import customerInfoRepository, {
  type CustomerInfoRepository,
} from "../repositories/customer-info-repository";
import { CustomerSummaryItem } from "../entities/customer-info";

/**
 * Use case for getting Customer Info list
 */
class GetCustomerInfoUseCase {
  constructor(private readonly _repository: CustomerInfoRepository) {}

  async getCustomerInfo(): Promise<Either<FailureType, CustomerSummaryItem[]>> {
    return execute(
      async () => {
        await new Promise((resolve) => setTimeout(resolve as () => void, 1000));
        const result = await this._repository.getCustomerInfo();
        return Right(result);
      },
      {
        funcTitle: `${GetCustomerInfoUseCase.name}.getCustomerInfo`,
        errorMessage: "Get Customer Info Error",
      }
    );
  }
}

const getCustomerInfoUseCase = new GetCustomerInfoUseCase(customerInfoRepository);

export default getCustomerInfoUseCase;
export { GetCustomerInfoUseCase };
