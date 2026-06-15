import type { PagePaginatedResponse } from "@/core/types/common";
import type { Loan } from "@/core/types/loan";
import { apiClient } from "../apiClient";
import loanService, { type LoanApiResponse, normalizeLoan } from "./loan-service";

vi.mock("../apiClient", () => ({
	apiClient: {
		get: vi.fn(),
		post: vi.fn(),
		put: vi.fn(),
	},
}));

const loanApiResponse: LoanApiResponse = {
	id: "loan-1",
	borrowerId: "customer-1",
	borrowerName: "Customer One",
	borrowerType: "CUSTOMER",
	principalAmount: 100,
	paidAmount: 0,
	installmentAmount: 10,
	monthlyPayment: 10,
	termMonths: 10,
	dueWarningDays: 7,
	dueDate: "2026-07-01",
	status: "NORMAL",
	startDate: "2026-06-01",
	memo: "",
	createdAt: "2026-06-01T00:00:00Z",
};

function createLoanPage(content: Array<LoanApiResponse | null>): PagePaginatedResponse<LoanApiResponse | null> {
	return {
		content,
		page: {
			size: content.length,
			number: 0,
			totalElements: content.length,
			totalPages: 1,
		},
	};
}

describe("loan-service", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("normalizes a valid loan response", () => {
		const normalized = normalizeLoan(loanApiResponse);

		expect(normalized.borrowerType).toBe("customer");
		expect(normalized.status).toBe("normal");
		expect(normalized.createdAt).toBe(loanApiResponse.createdAt);
	});

	it("skips null loan rows when listing loans", async () => {
		vi.mocked(apiClient.get).mockResolvedValue(createLoanPage([loanApiResponse, null]));

		const response = await loanService.getLoans();

		expect(response.content).toHaveLength(1);
		expect(response.numberOfElements).toBe(1);
		expect(response.content[0]).toMatchObject<Partial<Loan>>({
			id: loanApiResponse.id,
			borrowerType: "customer",
		});
	});
});
