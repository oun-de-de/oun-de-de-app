import type { CreateProductRequest, Product, UpdateProduct } from "@/core/types/product";
import { apiClient } from "../apiClient";

export enum ProductApi {
	List = "/products",
	Create = "/products",
}

const getProductList = (): Promise<Product[]> =>
	apiClient.get<Product[]>({
		url: ProductApi.List,
	});

const createProduct = (data: CreateProductRequest): Promise<Product> =>
	apiClient.post<Product>({
		url: ProductApi.Create,
		data,
	});

const updateProduct = (productId: string, data: Partial<UpdateProduct>): Promise<Product> =>
	apiClient.put<Product>({
		url: `${ProductApi.Create}/${productId}`,
		data,
	});

export default {
	getProductList,
	createProduct,
	updateProduct,
};
