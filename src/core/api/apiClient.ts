import type { AxiosRequestConfig } from "axios";
import { AuthNetworkService, NoAuthNetworkService } from "./network-service";

// Legacy API Client for backward compatibility with Auth
class APIClient {
	private service: AuthNetworkService;

	constructor() {
		this.service = AuthNetworkService.getInstance();
	}

	async get<T>(config: AxiosRequestConfig): Promise<T> {
		const response = await this.service.get<T>(config.url || "", {
			queryParameters: config.params,
			headers: config.headers,
			data: config.data,
			responseType: config.responseType,
			cancelToken: config.cancelToken,
			receiveTimeout: config.timeout,
		});
		return response.body as T;
	}

	async post<T>(config: AxiosRequestConfig): Promise<T> {
		const response = await this.service.post<T>(config.url || "", {
			queryParameters: config.params,
			headers: config.headers,
			data: config.data,
			responseType: config.responseType,
			cancelToken: config.cancelToken,
			receiveTimeout: config.timeout,
		});
		return response.body as T;
	}

	async put<T>(config: AxiosRequestConfig): Promise<T> {
		const response = await this.service.put<T>(config.url || "", {
			queryParameters: config.params,
			headers: config.headers,
			data: config.data,
			responseType: config.responseType,
			cancelToken: config.cancelToken,
			receiveTimeout: config.timeout,
		});
		return response.body as T;
	}

	async delete<T>(config: AxiosRequestConfig): Promise<T> {
		const response = await this.service.delete<T>(config.url || "", {
			queryParameters: config.params,
			headers: config.headers,
			data: config.data,
			responseType: config.responseType,
			cancelToken: config.cancelToken,
			receiveTimeout: config.timeout,
		});
		return response.body as T;
	}

	async request<T>(config: AxiosRequestConfig): Promise<T> {
		return this.service.axiosInstance.request<unknown, T>(config);
	}
}

// No-Auth API Client for backward compatibility without Auth
class NoAuthAPIClient {
	private service: NoAuthNetworkService;

	constructor() {
		this.service = NoAuthNetworkService.getInstance();
	}

	async get<T>(config: AxiosRequestConfig): Promise<T> {
		const response = await this.service.get<T>(config.url || "", {
			queryParameters: config.params,
			headers: config.headers,
			data: config.data,
			responseType: config.responseType,
			cancelToken: config.cancelToken,
			receiveTimeout: config.timeout,
		});
		return response.body as T;
	}

	async post<T>(config: AxiosRequestConfig): Promise<T> {
		const response = await this.service.post<T>(config.url || "", {
			queryParameters: config.params,
			headers: config.headers,
			data: config.data,
			responseType: config.responseType,
			cancelToken: config.cancelToken,
			receiveTimeout: config.timeout,
		});
		return response.body as T;
	}

	async put<T>(config: AxiosRequestConfig): Promise<T> {
		const response = await this.service.put<T>(config.url || "", {
			queryParameters: config.params,
			headers: config.headers,
			data: config.data,
			responseType: config.responseType,
			cancelToken: config.cancelToken,
			receiveTimeout: config.timeout,
		});
		return response.body as T;
	}

	async delete<T>(config: AxiosRequestConfig): Promise<T> {
		const response = await this.service.delete<T>(config.url || "", {
			queryParameters: config.params,
			headers: config.headers,
			data: config.data,
			responseType: config.responseType,
			cancelToken: config.cancelToken,
			receiveTimeout: config.timeout,
		});
		return response.body as T;
	}

	async request<T>(config: AxiosRequestConfig): Promise<T> {
		return this.service.axiosInstance.request<unknown, T>(config);
	}
}

export const apiClient = new APIClient();
export const noAuthApi = new NoAuthAPIClient();
