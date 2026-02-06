export type Product = {
	id: string;
	name: string;
	date: string;
	refNo: string;
	quantity: number;
	cost: number;
	price: number;
};

export type CreateProduct = Omit<Product, "id">;
