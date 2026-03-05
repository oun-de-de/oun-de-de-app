import { useParams } from "react-router";
import { ReportDetailView } from "./components/report-detail-view";
import { DEFAULT_REPORT_SLUG, hasReportDefinition } from "./report-registry";

export default function ReportDetailTemplate() {
	const { slug } = useParams<{ slug: string }>();
	const reportSlug = hasReportDefinition(slug) ? slug : DEFAULT_REPORT_SLUG;

	return <ReportDetailView reportSlug={reportSlug} />;
}
