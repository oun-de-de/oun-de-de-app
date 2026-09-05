import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, renderHook, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import customerService from "@/core/api/services/customer-service";
import invoiceService from "@/core/api/services/invoice-service";
import loanService from "@/core/api/services/loan-service";
import type { Customer } from "@/core/types/customer";
import type { Invoice, PaymentResult } from "@/core/types/invoice";
import type { Loan } from "@/core/types/loan";
import {
	fetchAllCustomers,
	fetchAllInvoices,
	fetchAllLoans,
	fetchAllPayments,
	fetchPaginatedAll,
	getCustomersWithinType,
} from "./report-data-utils";
import { combineQueryStates } from "./report-query-utils";
import { normalizeReportFilters } from "./report-table-utils";
import { ReportTable } from "./report-table";
import { ReportToolbar } from "../../components/layout/report-toolbar";
import { useInvoiceReportQuery } from "./useInvoiceReportQuery";
import { useReportTableData } from "./use-report-table-data";
import type { ReportDefinition } from "../report-types";

vi.mock("@/core/api/services/customer-service", () => ({
	default: {
		getCustomerList: vi.fn(),
	},
}));

vi.mock("@/core/api/services/invoice-service", () => ({
	default: {
		getInvoices: vi.fn(),
		getPayments: vi.fn(),
		listInvoiceDetails: vi.fn(),
	},
}));

vi.mock("@/core/api/services/loan-service", () => ({
	default: {
		getLoans: vi.fn(),
	},
}));

vi.mock("sonner", () => ({
	toast: {
		error: vi.fn(),
		success: vi.fn(),
	},
}));

vi.mock("./use-report-table-data", () => ({
	useReportTableData: vi.fn(),
}));

function createWrapper() {
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false, gcTime: Number.POSITIVE_INFINITY } },
	});
	return function Wrapper({ children }: { children: ReactNode }) {
		return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
	};
}

describe("Bounded Fixes - 6 Repro Situations", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	// Tình huống 1: Loan bắt đầu từ trang 0 và tải đủ các trang
	describe("1. Loan: Bắt đầu từ trang 0, tải đủ các trang", () => {
		it("calls loanService.getLoans starting at page 0 and fetches all remaining pages", async () => {
			const page0Loan = { id: "loan-0", borrowerName: "Borrower 0" } as Loan;
			const page1Loan = { id: "loan-1", borrowerName: "Borrower 1" } as Loan;

			vi.mocked(loanService.getLoans).mockImplementation(async (params) => {
				if (params?.page === 0) {
					return {
						content: [page0Loan],
						pageable: { pageNumber: 0, pageSize: 1, offset: 0, paged: true, unpaged: false },
						totalElements: 2,
						totalPages: 2,
						last: false,
						size: 1,
						number: 0,
						numberOfElements: 1,
						first: true,
						empty: false,
					} as never;
				}
				return {
					content: [page1Loan],
					pageable: { pageNumber: 1, pageSize: 1, offset: 1, paged: true, unpaged: false },
					totalElements: 2,
					totalPages: 2,
					last: true,
					size: 1,
					number: 1,
					numberOfElements: 1,
					first: false,
					empty: false,
				} as never;
			});

			const loans = await fetchAllLoans({ borrower_type: "customer" });

			expect(loanService.getLoans).toHaveBeenCalledWith(expect.objectContaining({ page: 0 }));
			expect(loanService.getLoans).toHaveBeenCalledWith(expect.objectContaining({ page: 1 }));
			expect(loans).toEqual([page0Loan, page1Loan]);
		});
	});

	// Tình huống 2: "All" dùng hàm chuẩn hóa hiện có trước khi lọc nhóm
	describe("2. “All”: Dùng hàm chuẩn hóa hiện có trước khi lọc nhóm", () => {
		const customers: Customer[] = [
			{ id: "cust-1", name: "Alpha", referredBy: "type-vip" } as Customer,
			{ id: "cust-2", name: "Beta", referredBy: "type-standard" } as Customer,
		];

		it("treats uppercase/mixed-case 'All' and ' ALL ' as all in getCustomersWithinType", () => {
			expect(getCustomersWithinType(customers, "All")).toEqual(customers);
			expect(getCustomersWithinType(customers, " ALL ")).toEqual(customers);
			expect(getCustomersWithinType(customers, "all")).toEqual(customers);
			expect(getCustomersWithinType(customers, undefined)).toEqual(customers);
		});

		it("treats 'All' as undefined/all in normalizeReportFilters", () => {
			const normalizedUpper = normalizeReportFilters({
				customerId: "All",
				customerTypeId: "ALL",
				productName: "all",
				fromDate: "",
				toDate: "",
				useDateRange: false,
			});
			expect(normalizedUpper.customerId).toBeUndefined();
			expect(normalizedUpper.customerTypeId).toBeUndefined();
			expect(normalizedUpper.productName).toBeUndefined();
		});
	});

	// Tình huống 3: Phân trang tải đủ hóa đơn, receipt và khách hàng
	describe("3. Phân trang: Tải đủ hóa đơn, receipt và khách hàng", () => {
		it("fetchAllInvoices loads all pages when pageCount > 1", async () => {
			const inv1 = { id: "inv-1" } as Invoice;
			const inv2 = { id: "inv-2" } as Invoice;

			vi.mocked(invoiceService.getInvoices).mockImplementation(async (params) => {
				if (params?.page === 1) {
					return { list: [inv1], page: 1, pageSize: 1, total: 2, pageCount: 2 };
				}
				return { list: [inv2], page: 2, pageSize: 1, total: 2, pageCount: 2 };
			});

			const results = await fetchAllInvoices();
			expect(invoiceService.getInvoices).toHaveBeenCalledWith(expect.objectContaining({ page: 1 }));
			expect(invoiceService.getInvoices).toHaveBeenCalledWith(expect.objectContaining({ page: 2 }));
			expect(results).toEqual([inv1, inv2]);
		});

		it("fetchAllPayments loads all pages when pageCount > 1", async () => {
			const pay1 = { id: "pay-1" } as PaymentResult;
			const pay2 = { id: "pay-2" } as PaymentResult;

			vi.mocked(invoiceService.getPayments).mockImplementation(async (params) => {
				if (params?.page === 1) {
					return { list: [pay1], page: 1, pageSize: 1, total: 2, pageCount: 2 };
				}
				return { list: [pay2], page: 2, pageSize: 1, total: 2, pageCount: 2 };
			});

			const results = await fetchAllPayments();
			expect(invoiceService.getPayments).toHaveBeenCalledWith(expect.objectContaining({ page: 1 }));
			expect(invoiceService.getPayments).toHaveBeenCalledWith(expect.objectContaining({ page: 2 }));
			expect(results).toEqual([pay1, pay2]);
		});

		it("fetchAllCustomers loads all pages when pageCount > 1", async () => {
			const cust1 = { id: "c-1", name: "C1" } as Customer;
			const cust2 = { id: "c-2", name: "C2" } as Customer;

			vi.mocked(customerService.getCustomerList).mockImplementation(async (params) => {
				if (params?.page === 1) {
					return { list: [cust1], page: 1, pageSize: 1, total: 2, pageCount: 2 };
				}
				return { list: [cust2], page: 2, pageSize: 1, total: 2, pageCount: 2 };
			});

			const results = await fetchAllCustomers();
			expect(customerService.getCustomerList).toHaveBeenCalledWith(expect.objectContaining({ page: 1 }));
			expect(customerService.getCustomerList).toHaveBeenCalledWith(expect.objectContaining({ page: 2 }));
			expect(results).toEqual([cust1, cust2]);
		});
	});

	// Tình huống 4: Nếu một trang lỗi, không hiển thị tổng từ dữ liệu thiếu
	describe("4. Phân trang lỗi: Không hiển thị tổng từ dữ liệu thiếu", () => {
		it("throws when a subsequent invoice page fails, instead of returning partial data", async () => {
			vi.mocked(invoiceService.getInvoices).mockImplementation(async (params) => {
				if (params?.page === 1) {
					return { list: [{ id: "inv-1" } as Invoice], page: 1, pageSize: 1, total: 2, pageCount: 2 };
				}
				throw new Error("Network error on page 2");
			});

			await expect(fetchAllInvoices()).rejects.toThrow("Network error on page 2");
		});

		it("causes useInvoiceReportQuery to return isError: true and empty invoices on error", async () => {
			vi.mocked(invoiceService.getInvoices).mockRejectedValue(new Error("Server error"));

			const definition = { slug: "sale-detail-by-customer", dataSource: "invoice-export" } as ReportDefinition;
			const { result } = renderHook(
				() =>
					useInvoiceReportQuery({
						definition,
						filters: { fromDate: "2026-06-01", toDate: "2026-06-30" } as never,
						isInvoiceExport: true,
						hasRequiredDateFilters: true,
						customerId: undefined,
						customerTypeId: undefined,
						customerTypeCustomerNames: new Set<string>(),
					}),
				{ wrapper: createWrapper() },
			);

			await waitFor(() => expect(result.current.isError).toBe(true));
			expect(result.current.invoices).toEqual([]);
			expect(result.current.exportLines).toEqual([]);
			expect(result.current.previewRows).toEqual([]);
		});
	});

	// Tình huống 5: Cache dùng toàn bộ danh sách ID hóa đơn làm khóa
	describe("5. Cache: Dùng toàn bộ danh sách ID hóa đơn làm khóa", () => {
		it("refetches export details when middle invoice ID changes with same length and endpoints", async () => {
			const queryClient = new QueryClient({
				defaultOptions: { queries: { retry: false, gcTime: Number.POSITIVE_INFINITY } },
			});
			const wrapper = ({ children }: { children: ReactNode }) => (
				<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
			);

			// Batch 1: inv-1, inv-2, inv-3
			vi.mocked(invoiceService.getInvoices).mockResolvedValueOnce({
				list: [
					{ id: "inv-1", customerName: "C", amount: 100 } as Invoice,
					{ id: "inv-2", customerName: "C", amount: 200 } as Invoice,
					{ id: "inv-3", customerName: "C", amount: 300 } as Invoice,
				],
				page: 1,
				pageSize: 1000,
				total: 3,
				pageCount: 1,
			});
			vi.mocked(invoiceService.listInvoiceDetails).mockResolvedValue([]);

			const definition = {
				slug: "sale-detail-by-customer",
				dataSource: "invoice-export",
				needsPreviewRows: true,
			} as ReportDefinition;

			const { result, rerender } = renderHook(
				(props) =>
					useInvoiceReportQuery({
						definition,
						filters: props?.filters ?? ({ fromDate: "2026-06-01", toDate: "2026-06-30" } as never),
						isInvoiceExport: true,
						hasRequiredDateFilters: true,
						customerId: undefined,
						customerTypeId: undefined,
						customerTypeCustomerNames: new Set<string>(),
					}),
				{ wrapper, initialProps: { filters: { fromDate: "2026-06-01", toDate: "2026-06-30" } as never } },
			);

			await waitFor(() => expect(result.current.invoices).toHaveLength(3));
			expect(invoiceService.listInvoiceDetails).toHaveBeenCalledWith(["inv-1", "inv-2", "inv-3"], expect.anything());

			// Batch 2: inv-1, inv-999, inv-3 (same length = 3, same first = inv-1, same last = inv-3, but different middle)
			vi.mocked(invoiceService.getInvoices).mockResolvedValueOnce({
				list: [
					{ id: "inv-1", customerName: "C", amount: 100 } as Invoice,
					{ id: "inv-999", customerName: "C", amount: 999 } as Invoice,
					{ id: "inv-3", customerName: "C", amount: 300 } as Invoice,
				],
				page: 1,
				pageSize: 1000,
				total: 3,
				pageCount: 1,
			});

			// Re-render with new date filter to trigger invoice refetch
			rerender({ filters: { fromDate: "2026-07-01", toDate: "2026-07-31" } as never });

			await waitFor(() =>
				expect(invoiceService.listInvoiceDetails).toHaveBeenCalledWith(
					["inv-1", "inv-999", "inv-3"],
					expect.anything(),
				),
			);
		});
	});

	// Tình huống 6: Trạng thái lỗi: bảng báo lỗi, có Retry; không cho Copy dữ liệu chưa tải đầy đủ
	describe("6. Trạng thái lỗi: Bảng báo lỗi và có Retry; không cho Copy dữ liệu chưa tải đầy đủ", () => {
		it("renders error message and Retry button in ReportTable when isError is true", () => {
			const mockRefetch = vi.fn();
			vi.mocked(useReportTableData).mockReturnValue({
				definition: { title: "Report", subtitle: "", filterConfig: {}, summaryRows: [], emptyText: "No Data" },
				invoiceIds: [],
				previewRows: [],
				selectedCustomerLabel: undefined,
				selectedCustomer: undefined,
				selectedCustomerTypeLabel: undefined,
				customerTypeCustomerCount: undefined,
				sourceRows: [],
				sortedRows: [{ key: "row-1", cells: { name: "REAL_DATA" } }],
				isLoading: false,
				isError: true,
				refetch: mockRefetch,
			} as never);

			render(
				<ReportTable
					columns={[{ id: "name", header: "Name", cell: (info) => info.row.original.cells.name }]}
					reportSlug="sale-detail-by-customer"
				/>,
			);

			expect(screen.getByText("Failed to load report data.")).toBeInTheDocument();
			const retryButton = screen.getByRole("button", { name: "Retry" });
			expect(retryButton).toBeInTheDocument();

			fireEvent.click(retryButton);
			expect(mockRefetch).toHaveBeenCalledTimes(1);

			// Real row data and totals should NOT be displayed on error
			expect(screen.queryByText("REAL_DATA")).not.toBeInTheDocument();
		});

		it("passes isError and isLoading to onTableDataChange to guard against copying incomplete data", () => {
			const onTableDataChange = vi.fn();
			vi.mocked(useReportTableData).mockReturnValue({
				definition: { title: "Report", subtitle: "", filterConfig: {}, summaryRows: [], emptyText: "No Data" },
				invoiceIds: [],
				previewRows: [],
				selectedCustomerLabel: undefined,
				selectedCustomer: undefined,
				selectedCustomerTypeLabel: undefined,
				customerTypeCustomerCount: undefined,
				sourceRows: [],
				sortedRows: [],
				isLoading: true,
				isError: false,
				refetch: vi.fn(),
			} as never);

			render(
				<ReportTable
					columns={[{ id: "name", header: "Name", cell: (info) => info.row.original.cells.name }]}
					reportSlug="sale-detail-by-customer"
					onTableDataChange={onTableDataChange}
				/>,
			);

			expect(onTableDataChange).toHaveBeenCalledWith(
				expect.objectContaining({
					isLoading: true,
					isError: false,
				}),
			);
		});

		it("hides summaryRows while isLoading is true to prevent premature Grand Total calculation", () => {
			vi.mocked(useReportTableData).mockReturnValue({
				definition: {
					title: "Report",
					subtitle: "",
					filterConfig: {},
					summaryRows: [{ key: "grand-total", label: "Grand Total", value: "$0.00" }],
					emptyText: "No Data",
				},
				invoiceIds: [],
				previewRows: [],
				selectedCustomerLabel: undefined,
				selectedCustomer: undefined,
				selectedCustomerTypeLabel: undefined,
				customerTypeCustomerCount: undefined,
				sourceRows: [],
				sortedRows: [],
				isLoading: true,
				isError: false,
				refetch: vi.fn(),
			} as never);

			render(
				<ReportTable
					columns={[{ id: "name", header: "Name", cell: (info) => info.row.original.cells.name }]}
					reportSlug="sale-detail-by-customer"
				/>,
			);

			expect(screen.getByText("Loading...")).toBeInTheDocument();
			expect(screen.queryByText("Grand Total")).not.toBeInTheDocument();
		});

		it("displays summaryRows when isLoading is false and isError is false", () => {
			vi.mocked(useReportTableData).mockReturnValue({
				definition: {
					title: "Report",
					subtitle: "",
					filterConfig: {},
					summaryRows: [{ key: "grand-total", label: "Grand Total", value: "$500.00" }],
					emptyText: "No Data",
				},
				invoiceIds: [],
				previewRows: [],
				selectedCustomerLabel: undefined,
				selectedCustomer: undefined,
				selectedCustomerTypeLabel: undefined,
				customerTypeCustomerCount: undefined,
				sourceRows: [],
				sortedRows: [],
				isLoading: false,
				isError: false,
				refetch: vi.fn(),
			} as never);

			render(
				<ReportTable
					columns={[{ id: "name", header: "Name", cell: (info) => info.row.original.cells.name }]}
					reportSlug="sale-detail-by-customer"
				/>,
			);

			expect(screen.getByText("Grand Total")).toBeInTheDocument();
			expect(screen.getByText("$500.00")).toBeInTheDocument();
		});

		it("ReportToolbar renders Copy button as disabled when isCopyDisabled is true", () => {
			render(<ReportToolbar onCopy={vi.fn()} isCopyDisabled={true} />);
			const copyButton = screen.getByRole("button", { name: "Copy" });
			expect(copyButton).toBeDisabled();
		});

		it("ReportToolbar renders Copy button as enabled when isCopyDisabled is false", () => {
			render(<ReportToolbar onCopy={vi.fn()} isCopyDisabled={false} />);
			const copyButton = screen.getByRole("button", { name: "Copy" });
			expect(copyButton).not.toBeDisabled();
		});
	});

	// Test Matrix: fetchPaginatedAll
	describe("fetchPaginatedAll generic pagination", () => {
		it("handles 1-index with 1 page", async () => {
			const fetchPage = vi.fn().mockResolvedValue({
				items: ["item-1", "item-2"],
				totalPageCount: 1,
			});

			const results = await fetchPaginatedAll(fetchPage, { pageBase: 1 });

			expect(fetchPage).toHaveBeenCalledTimes(1);
			expect(fetchPage).toHaveBeenCalledWith(1);
			expect(results).toEqual(["item-1", "item-2"]);
		});

		it("handles 1-index with multiple pages asserting sequence 1, 2, 3", async () => {
			const fetchPage = vi.fn().mockImplementation(async (page: number) => ({
				items: [`item-p${page}-1`, `item-p${page}-2`],
				totalPageCount: 3,
			}));

			const results = await fetchPaginatedAll(fetchPage, { pageBase: 1 });

			expect(fetchPage).toHaveBeenCalledTimes(3);
			expect(fetchPage).toHaveBeenNthCalledWith(1, 1);
			expect(fetchPage).toHaveBeenNthCalledWith(2, 2);
			expect(fetchPage).toHaveBeenNthCalledWith(3, 3);
			expect(results).toEqual(["item-p1-1", "item-p1-2", "item-p2-1", "item-p2-2", "item-p3-1", "item-p3-2"]);
		});

		it("handles 0-index with multiple pages asserting sequence 0, 1, 2", async () => {
			const fetchPage = vi.fn().mockImplementation(async (page: number) => ({
				items: [`loan-p${page}-a`],
				totalPageCount: 3,
			}));

			const results = await fetchPaginatedAll(fetchPage, { pageBase: 0 });

			expect(fetchPage).toHaveBeenCalledTimes(3);
			expect(fetchPage).toHaveBeenNthCalledWith(1, 0);
			expect(fetchPage).toHaveBeenNthCalledWith(2, 1);
			expect(fetchPage).toHaveBeenNthCalledWith(3, 2);
			expect(results).toEqual(["loan-p0-a", "loan-p1-a", "loan-p2-a"]);
		});

		it("preserves item order across pages", async () => {
			const fetchPage = vi.fn().mockImplementation(async (page: number) => {
				if (page === 1) return { items: ["a", "b"], totalPageCount: 2 };
				return { items: ["c", "d"], totalPageCount: 2 };
			});

			const results = await fetchPaginatedAll(fetchPage);
			expect(results).toEqual(["a", "b", "c", "d"]);
		});

		it("rejects whole call when one page rejects", async () => {
			const fetchPage = vi.fn().mockImplementation(async (page: number) => {
				if (page === 1) return { items: ["a"], totalPageCount: 3 };
				if (page === 2) throw new Error("Page 2 network timeout");
				return { items: ["c"], totalPageCount: 3 };
			});

			await expect(fetchPaginatedAll(fetchPage, { pageBase: 1 })).rejects.toThrow("Page 2 network timeout");
		});
	});

	// Test Matrix: combineQueryStates
	describe("combineQueryStates orchestration", () => {
		it("returns false for isLoading and isError when all slices are false", () => {
			const state = combineQueryStates({ isLoading: false, isError: false }, { isLoading: false, isError: false });
			expect(state.isLoading).toBe(false);
			expect(state.isError).toBe(false);
		});

		it("sets isLoading to true when at least one query is loading", () => {
			const state = combineQueryStates(
				{ isLoading: false, isError: false },
				{ isLoading: true, isError: false },
				{ isLoading: false, isError: false },
			);
			expect(state.isLoading).toBe(true);
			expect(state.isError).toBe(false);
		});

		it("sets isError to true when at least one query is errored", () => {
			const state = combineQueryStates({ isLoading: false, isError: false }, { isLoading: false, isError: true });
			expect(state.isLoading).toBe(false);
			expect(state.isError).toBe(true);
		});

		it("refetch triggers all slices that have refetch", async () => {
			const refetch1 = vi.fn().mockResolvedValue(undefined);
			const refetch2 = vi.fn().mockResolvedValue(undefined);

			const state = combineQueryStates({ refetch: refetch1 }, { refetch: refetch2 });

			await state.refetch();
			expect(refetch1).toHaveBeenCalledTimes(1);
			expect(refetch2).toHaveBeenCalledTimes(1);
		});

		it("handles slices without refetch gracefully without error", async () => {
			const refetch1 = vi.fn().mockResolvedValue(undefined);

			const state = combineQueryStates({ refetch: refetch1 }, { isLoading: false }, {});

			await expect(state.refetch()).resolves.toBeUndefined();
			expect(refetch1).toHaveBeenCalledTimes(1);
		});

		it("await refetch() waits for all slice refetches to resolve", async () => {
			let resolvedCount = 0;
			const slowRefetch = vi.fn().mockImplementation(async () => {
				await new Promise((r) => setTimeout(r, 20));
				resolvedCount++;
			});
			const fastRefetch = vi.fn().mockImplementation(async () => {
				resolvedCount++;
			});

			const state = combineQueryStates({ refetch: slowRefetch }, { refetch: fastRefetch });

			await state.refetch();
			expect(resolvedCount).toBe(2);
		});
	});
});
