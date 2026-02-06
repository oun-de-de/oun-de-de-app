import type { CreateProduct, Product } from "@/core/types/product";
import { apiClient } from "../apiClient";

export enum ProductApi {
	List = "/products",
	Create = "/products",
}

const getProductList = (): Promise<Product[]> =>
	apiClient.get<Product[]>({
		url: ProductApi.List,
	});

const createProduct = (data: CreateProduct): Promise<Product> =>
	apiClient.post<Product>({
		url: ProductApi.Create,
		data,
	});

export default {
	getProductList,
	createProduct,
};
