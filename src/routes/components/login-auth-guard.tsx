import { useIsAuthenticated } from "@/core/services/auth/hooks/use-auth";
import { useCallback, useEffect } from "react";
import { useRouter } from "../hooks";

type Props = {
	children: React.ReactNode;
};
export default function LoginAuthGuard({ children }: Props) {
	const router = useRouter();
	const isAuthenticated = useIsAuthenticated();

	const check = useCallback(() => {
		if (!isAuthenticated) {
			router.replace("/auth/login");
		}
	}, [router, isAuthenticated]);

	useEffect(() => {
		check();
	}, [check]);

	return <>{children}</>;
}
