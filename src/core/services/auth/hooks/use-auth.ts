import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppAuthAccount } from "../models/app-auth-account";
import { AppAuthService } from "../app-auth-service";
import { UsernameAuthCredential } from "..";

/**
 * Get the singleton auth service instance
 */
export function getAuthService(): AppAuthService {
	return AppAuthService.getInstance();
}

/**
 * Hook to access auth service
 */
export function useAuthService(): AppAuthService {
	return getAuthService();
}

/**
 * Hook to get current authenticated user
 * Re-renders when auth state changes
 */
export function useAuthUser(): AppAuthAccount | null {
	const authService = useAuthService();
	const [user, setUser] = useState<AppAuthAccount | null>(authService.getCurrentUser());

	useEffect(() => {
		// Subscribe to auth state changes
		const subscription = authService.authStateChanges.subscribe((account) => {
			setUser(account);
		});

		return () => subscription.unsubscribe();
	}, [authService]);

	return user;
}

/**
 * Hook to check if user is authenticated
 */
export function useIsAuthenticated(): boolean {
	const user = useAuthUser();
	return user?.isAuthenticated ?? false;
}

/**
 * Hook for sign in functionality
 */
export function useSignIn() {
	const authService = useAuthService();

	const signIn = async (username: string, password: string) => {
		try {
			const credential = new UsernameAuthCredential("username", username, password);
			const account = await authService.login(credential);

			toast.success("Sign in successful!", {
				closeButton: true,
			});

			return account;
		} catch (error: any) {
			toast.error(error.message || "Sign in failed", {
				position: "top-center",
			});
			throw error;
		}
	};

	return signIn;
}

/**
 * Hook for sign out functionality
 */
export function useSignOut() {
	const authService = useAuthService();

	const signOut = async () => {
		try {
			await authService.logout();

			toast.success("Signed out successfully", {
				closeButton: true,
			});
		} catch (error: any) {
			toast.error(error.message || "Sign out failed", {
				position: "top-center",
			});
			throw error;
		}
	};

	return signOut;
}

/**
 * Hook to get user info
 */
export function useUserInfo() {
	const user = useAuthUser();
	return user?.data?.data ?? null;
}

/**
 * Hook to get access token
 */
export function useAccessToken(): string | null {
	const authService = useAuthService();
	const user = useAuthUser();
	return user ? authService.getAccessToken() : null;
}

/**
 * Hook to check user permissions
 */
export function useUserPermissions(): string[] {
	const user = useAuthUser();
	return user?.permissions ?? [];
}

/**
 * Hook to check user roles
 */
export function useUserRoles(): string[] {
	const user = useAuthUser();
	return user?.roles ?? [];
}

/**
 * Hook to check if user has specific permission
 */
export function useHasPermission(permission: string): boolean {
	const user = useAuthUser();
	return user?.hasPermission(permission) ?? false;
}

/**
 * Hook to check if user has specific role
 */
export function useHasRole(role: string): boolean {
	const user = useAuthUser();
	return user?.hasRole(role) ?? false;
}
