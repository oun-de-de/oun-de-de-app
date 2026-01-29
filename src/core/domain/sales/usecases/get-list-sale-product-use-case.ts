import { emptyPagination, Pagination } from "@/core/types/pagination";
import { SaleProductRepository } from "../repositories/sale-product-repository";
import { SaleProduct } from "../entities/sale-product";
import execute from "@/core/utils/execute";
import { SaleFilters } from "../entities/sale-filter";
import { Either, Right } from "@/core/interfaces/either";
import { FailureType } from "@/core/types/failure";
import { updatePage } from "@/core/utils/pagination";

class GetSaleProductListUseCase {
	constructor(private readonly _repository: SaleProductRepository) {}

	async getSaleProductList({
		pagination = emptyPagination(),
		limit,
		filters,
		search,
		categoryIds,
	}: {
		pagination?: Pagination<SaleProduct>;
		limit?: number;
		filters: SaleFilters;
		search?: string;
		categoryIds?: (string | number)[];
	}): Promise<Either<FailureType, Pagination<SaleProduct>>> {
		const page = pagination.page + 1;

		return execute(
			async () => {
				await new Promise((resolve) => setTimeout(resolve, 2000));
				const result = await this._repository.getProducts({
					page,
					limit,
					search,
					filters,
					categoryIds,
				});

				return Right(updatePage(pagination, result));
			},
			{
				funcTitle: `${GetSaleProductListUseCase.name}.getSaleProductList`,
				errorMessage: "Failed to get sale product list",
			},
		);
	}
}

export { GetSaleProductListUseCase };
