import { Button } from "@/core/ui/button";
import { useRouter } from "@/routes/hooks";

function CustomerButtonActions() {
	const router = useRouter();

	return (
		<Button size="sm" onClick={() => router.push("/dashboard/customers/create")}>
			Create Customer
		</Button>
	);
}

export default CustomerButtonActions;
