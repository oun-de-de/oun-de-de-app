import { Button } from "@/core/ui/button";
import { useLocation, useNavigate } from "react-router";

function CustomerButtonActions() {
	const location = useLocation();
	const navigate = useNavigate();
	const returnTo = `${location.pathname}${location.search}`;

	return (
		<Button size="sm" onClick={() => navigate("/dashboard/customers/create", { state: { returnTo } })}>
			Create Customer
		</Button>
	);
}

export default CustomerButtonActions;
