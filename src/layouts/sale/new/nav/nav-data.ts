export const saleNavData = [
	{
		path: "/sale/new/cash-sale",
		auth: ["sale:create", "sale:cash-sale"],
	},
	{
		path: "/sale/new/invoice",
		auth: ["sale:create", "sale:invoice"],
	},
];
