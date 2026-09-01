import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import invoiceService from "@/core/api/services/invoice-service";
import type { ReportDefinition } from "../report-types";
import { useInvoiceReportQuery } from "./useInvoiceReportQuery";

vi.mock("@/core/api/services/invoice-service", () => ({
	default: {
		getInvoices: vi.fn(),
		getPayments: vi.fn(),
		listInvoiceDetails: vi.fn(),
	},
}));

const ALICE = { id: "inv-a", refNo: "IN1", customerName: "Alice", date: "2026-06-01", amount: 100 };
const BOB = { id: "inv-b", refNo: "IN2", customerName: "Bob", date: "2026-06-02", amount: 200 };

function createWrapper() {
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false, gcTime: Number.POSITIVE_INFINITY } },
	});
	return function Wrapper({ children }: { children: ReactNode }) {
		return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
	};
}

function renderQuery(options: {
	slug: "sale-detail-by-customer" | "receipt-detail-by-customer";
	customerId?: string;
	customerTypeId?: string;
	typeMemberNames: string[];
}) {
	const definition = { slug: options.slug, dataSource: "invoice-export" } as ReportDefinition;

	return renderHook(
		() =>
			useInvoiceReportQuery({
				definition,
				filters: { fromDate: "2026-06-01", toDate: "2026-06-30" } as never,
				isInvoiceExport: true,
				hasRequiredDateFilters: true,
				customerId: options.customerId,
				customerTypeId: options.customerTypeId,
				customerTypeCustomerNames: new Set(options.typeMemberNames),
			}),
		{ wrapper: createWrapper() },
	);
}

describe("useInvoiceReportQuery customer + customer type filters", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// The API is asked for one customer or for all; it never sees the type filter.
		vi.mocked(invoiceService.getInvoices).mockImplementation(async ({ customerId } = {}) => ({
			list: customerId === "cust-alice" ? [ALICE] : [ALICE, BOB],
			page: 1,
			pageSize: 10000,
			total: 2,
			pageCount: 1,
		}));
		vi.mocked(invoiceService.getPayments).mockImplementation(async ({ customerId } = {}) => ({
			list: customerId === "cust-alice" ? [{ ...ALICE, received: 100 }] : [ALICE, BOB].map((i) => ({ ...i })),
			page: 1,
			pageSize: 10000,
			total: 2,
			pageCount: 1,
		}));
		vi.mocked(invoiceService.listInvoiceDetails).mockResolvedValue([]);
	});

	it("sends customerId to the API when only Customer is picked", async () => {
		const { result } = renderQuery({ slug: "sale-detail-by-customer", customerId: "cust-alice", typeMemberNames: [] });

		await waitFor(() => expect(result.current.invoices).toHaveLength(1));
		expect(invoiceService.getInvoices).toHaveBeenCalledWith(expect.objectContaining({ customerId: "cust-alice" }));
		expect(result.current.invoices[0]?.customerName).toBe("Alice");
	});

	it("filters by type name when only Customer Type is picked", async () => {
		const { result } = renderQuery({
			slug: "sale-detail-by-customer",
			customerTypeId: "type-1",
			typeMemberNames: ["bob"],
		});

		await waitFor(() => expect(result.current.invoices).toHaveLength(1));
		expect(invoiceService.getInvoices).toHaveBeenCalledWith(expect.objectContaining({ customerId: undefined }));
		expect(result.current.invoices[0]?.customerName).toBe("Bob");
	});

	it("keeps the customer filter when Customer and a matching Customer Type are both picked", async () => {
		const { result } = renderQuery({
			slug: "sale-detail-by-customer",
			customerId: "cust-alice",
			customerTypeId: "type-1",
			typeMemberNames: ["alice"],
		});

		await waitFor(() => expect(result.current.invoices).toHaveLength(1));
		// Regression guard: customerId must still reach the API, not be dropped for the type filter.
		expect(invoiceService.getInvoices).toHaveBeenCalledWith(expect.objectContaining({ customerId: "cust-alice" }));
		expect(result.current.invoices[0]?.customerName).toBe("Alice");
	});

	it("returns nothing when the picked Customer does not belong to the picked Customer Type", async () => {
		const { result } = renderQuery({
			slug: "sale-detail-by-customer",
			customerId: "cust-alice",
			customerTypeId: "type-1",
			typeMemberNames: ["bob"],
		});

		await waitFor(() => expect(invoiceService.getInvoices).toHaveBeenCalled());
		await waitFor(() => expect(result.current.invoices).toEqual([]));
	});

	it("applies the same AND rule on the receipt report, which reads /payments", async () => {
		const { result } = renderQuery({
			slug: "receipt-detail-by-customer",
			customerId: "cust-alice",
			customerTypeId: "type-1",
			typeMemberNames: ["bob"],
		});

		await waitFor(() => expect(invoiceService.getPayments).toHaveBeenCalled());
		expect(invoiceService.getPayments).toHaveBeenCalledWith(expect.objectContaining({ customerId: "cust-alice" }));
		await waitFor(() => expect(result.current.invoices).toEqual([]));
	});
});
