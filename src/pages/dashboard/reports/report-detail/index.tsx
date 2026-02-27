import { useParams } from "react-router";
import { ReportDetailView } from "./components/report-detail-view";
import { DEFAULT_REPORT_SLUG } from "./report-registry";

export default function ReportDetailTemplate() {
	const { slug } = useParams<{ slug: string }>();
	const reportSlug = slug ?? DEFAULT_REPORT_SLUG;

	return <ReportDetailView reportSlug={reportSlug} />;
}
