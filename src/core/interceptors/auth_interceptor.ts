import type { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from "axios";
import { AppAuthService } from "../services/auth";
import { toast } from "sonner";
import { t } from "@/core/locales/i18n";

export interface AuthInterceptorConfig {
	retryDioBuilder: () => AxiosInstance;
}

/**
 * Auth Interceptor for handling authentication and token refresh
 * Based on Dart AuthInterceptor implementation
 */
export class AuthInterceptor {
	private retryDioBuilder: () => AxiosInstance;
	private isRefreshing = false;
	private failedQueue: Array<{
		resolve: (value?: unknown) => void;
		reject: (error?: unknown) => void;
	}> = [];

	constructor(config: AuthInterceptorConfig) {
		this.retryDioBuilder = config.retryDioBuilder;
	}

	/**
	 * Process queued requests after token refresh
	 */
	private processQueue(error: AxiosError | null, token: string | null = null): void {
		this.failedQueue.forEach((prom) => {
			if (error) {
				prom.reject(error);
			} else {
				prom.resolve(token);
			}
		});

		this.failedQueue = [];
	}

	/**
	 * Request interceptor - adds access token to headers
	 */
	async onRequest(config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> {
		const authService = AppAuthService.getInstance();

		// Check refresh token validity
		const refreshToken = authService.getRefreshToken();
		const currentUser = authService.getCurrentUser();

		if (refreshToken && currentUser?.refreshToken && !currentUser.refreshToken.isValid) {
			await authService.logout();
			this.showEndSessionDialog();
			throw new Error("Refresh token is invalid");
		}

		// Get and add access token
		const accessToken = authService.getAccessToken();

		if (!accessToken) {
			await authService.logout();
			throw new Error("No access token found");
		}

		config.headers.Authorization = `Bearer ${accessToken}`;

		return config;
	}

	/**
	 * Response error interceptor - handles 401 and token refresh
	 */
	async onResponseError(error: AxiosError): Promise<AxiosResponse> {
		const originalRequest = error.config as InternalAxiosRequestConfig & {
			_retry?: boolean;
		};

		// Handle 401 Unauthorized
		if (error.response?.status === 401) {
			const authService = AppAuthService.getInstance();

			// Check if user is authenticated
			if (!authService.isAuthenticated()) {
				return Promise.reject(error);
			}

			// Prevent infinite retry loop
			if (originalRequest._retry) {
				await authService.logout();
				this.showEndSessionDialog();
				return Promise.reject(error);
			}

			// If already refreshing, queue this request
			if (this.isRefreshing) {
				return new Promise((resolve, reject) => {
					this.failedQueue.push({ resolve, reject });
				})
					.then(() => {
						return this.retry(originalRequest);
					})
					.catch((err) => {
						return Promise.reject(err);
					});
			}

			originalRequest._retry = true;
			this.isRefreshing = true;

			try {
				// Attempt to refresh token by re-authenticating
				// You may need to implement refresh token logic in AuthService
				// For now, just get the current access token
				const newAccessToken = authService.getAccessToken();

				if (!newAccessToken) {
					await authService.logout();
					this.showEndSessionDialog();
					this.processQueue(error, null);
					return Promise.reject(error);
				}

				// Update token for all queued requests
				this.processQueue(null, newAccessToken);

				// Retry original request with new token
				return await this.retry(originalRequest, newAccessToken);
			} catch (refreshError) {
				this.processQueue(refreshError as AxiosError, null);
				await authService.logout();
				this.showEndSessionDialog();
				return Promise.reject(refreshError);
			} finally {
				this.isRefreshing = false;
			}
		}

		return Promise.reject(error);
	}

	/**
	 * Retry failed request with new access token
	 */
	private async retry(requestOptions: InternalAxiosRequestConfig, newAccessToken?: string): Promise<AxiosResponse> {
		const retryDio = this.retryDioBuilder();

		// Clone request data if it's FormData
		let data = requestOptions.data;
		if (data instanceof FormData) {
			const clonedFormData = new FormData();
			data.forEach((value, key) => {
				clonedFormData.append(key, value);
			});
			data = clonedFormData;
		}

		// Update authorization header with new token
		if (newAccessToken) {
			requestOptions.headers.Authorization = `Bearer ${newAccessToken}`;
		}

		// Add error interceptor for retry request
		retryDio.interceptors.response.use(
			(response) => response,
			async (error: AxiosError) => {
				if (error.response?.status === 401) {
					await AppAuthService.getInstance().logout();
					this.showEndSessionDialog();
					return Promise.reject(error);
				}
				return Promise.reject(error);
			},
		);

		return retryDio.request({
			...requestOptions,
			data,
		});
	}

	/**
	 * Show end session dialog
	 */
	private showEndSessionDialog(): void {
		const title = t("sys.api.forceLogout", "Force logout");
		const content = t("sys.api.forceLogoutContent", "Session expired, please sign in again");

		this.showErrorDialog(title, content);
	}

	/**
	 * Show error dialog
	 */
	private showErrorDialog(title: string, content: string): void {
		// Use setTimeout to ensure it runs after current call stack
		setTimeout(() => {
			console.debug(`[Auth Interceptor] ${title}: ${content}`);
			toast.error(content, {
				description: title,
				position: "top-center",
				duration: 5000,
			});
		}, 0);
	}

	/**
	 * Setup interceptors on axios instance
	 */
	static setup(axios: AxiosInstance, config: AuthInterceptorConfig): void {
		const interceptor = new AuthInterceptor(config);

		axios.interceptors.request.use(
			(config) => interceptor.onRequest(config),
			(error) => Promise.reject(error),
		);

		axios.interceptors.response.use(
			(response) => response,
			(error) => interceptor.onResponseError(error),
		);
	}
}
