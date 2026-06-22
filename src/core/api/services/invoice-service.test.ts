import { apiClient } from "../apiClient";
import { listInvoiceDetails } from "./invoice-service";

vi.mock("../apiClient", () => ({
	apiClient: {
		post: vi.fn().mockResolvedValue([]),
	},
}));

describe("invoice-service", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("posts invoice export without productName when product is all", async () => {
		await listInvoiceDetails(["invoice-1"], { productName: undefined });

		expect(apiClient.post).toHaveBeenCalledWith({
			url: "/invoices/export",
			data: {
				invoiceIds: ["invoice-1"],
			},
		});
	});

	it("posts invoice export with selected productName and referredBy", async () => {
		await listInvoiceDetails(["invoice-1"], {
			productName: "Tube Ice",
			referredBy: "customer-referrer",
		});

		expect(apiClient.post).toHaveBeenCalledWith({
			url: "/invoices/export",
			data: {
				invoiceIds: ["invoice-1"],
				productName: "Tube Ice",
				referredBy: "customer-referrer",
			},
		});
	});
});
