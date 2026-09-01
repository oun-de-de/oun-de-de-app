import { reportSections } from "@/_mock/data/dashboard";
import { buildMonthlyReportDetailRows } from "../components/report-table-builders";
import { REPORT_REGISTRY } from "./index";

describe("report registry", () => {
	it("only links to reports that actually have a definition", () => {
		const linkedSlugs = reportSections.flatMap((section) => section.items.map((item) => item.slug));
		// A slug with no definition silently falls back to the default report, opening the wrong page.
		expect(linkedSlugs.filter((slug) => !(slug in REPORT_REGISTRY))).toEqual([]);
	});

	it("declares no column that its row builder never fills", () => {
		const line = {
			date: "2026-08-01",
			refNo: "REC001",
			reason: "Receipt",
			customerName: "Alice",
			memo: "memo",
			debit: 1000,
			credit: 0,
			balance: 1000,
		};
		const emittedKeys = new Set(Object.keys(buildMonthlyReportDetailRows({ lines: [line] })[0]?.cells ?? {}));

		for (const slug of ["general-ledger", "balance-sheet"]) {
			const columnIds = REPORT_REGISTRY[slug].buildColumns().map((column) => column.id);
			expect({ slug, missing: columnIds.filter((id) => !emittedKeys.has(id)) }).toEqual({ slug, missing: [] });
		}
	});
});
