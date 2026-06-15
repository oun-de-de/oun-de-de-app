import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { MemoryRouter } from "react-router";
import { ReportDetailView } from "./report-detail-view";

vi.mock("sonner", () => ({
	toast: {
		error: vi.fn(),
		success: vi.fn(),
	},
}));

vi.mock("@/core/components/common", () => ({
	BackButton: ({ onClick }: { onClick: () => void }) => (
		<button type="button" onClick={onClick}>
			Back
		</button>
	),
}));

vi.mock("../../components/layout/report-filter-bar", () => ({
	ReportFilterBar: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("../../components/layout/report-layout", () => ({
	ReportLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("../../components/layout/report-toolbar", () => ({
	ReportToolbar: ({ onCopy }: { onCopy: () => void }) => (
		<button type="button" onClick={onCopy}>
			Copy
		</button>
	),
}));

vi.mock("../report-specs", () => ({
	getReportDefinition: () => ({
		title: "Report",
		subtitle: "",
		filterConfig: { customer: false, dateRange: false },
		buildColumns: () => [{ id: "name", header: "Name" }],
		templateId: "test-template",
	}),
}));

vi.mock("../report-types", async () => {
	const actual = await vi.importActual<typeof import("../report-types")>("../report-types");
	return {
		...actual,
		createVisibleColumnMap: () => ({}),
		getReportColumnOptions: () => [],
		hasVisibleReportFilters: () => false,
	};
});

vi.mock("./report-table", () => ({
	ReportTable: ({ onTableDataChange }: { onTableDataChange?: (payload: unknown) => void }) => {
		React.useEffect(() => {
			onTableDataChange?.({
				rows: [{ id: "row-1", cells: { name: "Alice" } }],
				columns: [{ id: "name", header: "Name" }],
				hiddenColumnKeys: [],
			});
		}, [onTableDataChange]);

		return <div>Report table</div>;
	},
}));

describe("ReportDetailView", () => {
	it("shows an error instead of throwing when clipboard is unavailable", async () => {
		const user = userEvent.setup();
		const originalClipboard = navigator.clipboard;
		Object.defineProperty(navigator, "clipboard", {
			value: undefined,
			configurable: true,
		});

		try {
			render(
				<MemoryRouter>
					<ReportDetailView reportSlug="test-report" />
				</MemoryRouter>,
			);

			await waitFor(() => expect(screen.getByText("Report table")).toBeInTheDocument());
			await user.click(screen.getByRole("button", { name: "Copy" }));

			const { toast } = await import("sonner");
			expect(toast.error).toHaveBeenCalledWith("Clipboard is not available in this browser");
		} finally {
			Object.defineProperty(navigator, "clipboard", {
				value: originalClipboard,
				configurable: true,
			});
		}
	});
});
