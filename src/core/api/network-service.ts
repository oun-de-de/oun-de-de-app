import axios, {
	AxiosHeaders,
	AxiosProgressEvent,
	type CancelToken,
	type ResponseType,
	RawAxiosRequestHeaders,
	AxiosInstance,
	AxiosError,
	AxiosResponse,
} from "axios";
import { NetworkResponse } from "../types/network-response";
import { GLOBAL_CONFIG } from "@/global-config";
// server-side `Result` wrapper is handled at runtime; keep typings generic here
import { toast } from "sonner";
import { ResultStatus } from "../types/enum";
import { t } from "i18next";
import { AuthInterceptor } from "../interceptors/auth_interceptor";

// Request Options Interface
export interface NetworkRequestOptions {
	headers?: RawAxiosRequestHeaders | AxiosHeaders;
	queryParameters?: Record<string, unknown>;
	responseType?: ResponseType;
	data?: unknown;
	extra?: Record<string, unknown>;
	onSendProgress?: (progressEvent: AxiosProgressEvent) => void;
	onReceiveProgress?: (progressEvent: AxiosProgressEvent) => void;
	validateStatus?: (status: number | undefined) => boolean;
	receiveTimeout?: number;
	sendTimeout?: number;
	cancelToken?: CancelToken;
}

// Abstract Network Service Interface
export interface NetworkService {
	get<T>(path: string, options?: NetworkRequestOptions): Promise<NetworkResponse<T>>;
	post<T>(path: string, options?: NetworkRequestOptions): Promise<NetworkResponse<T>>;
	put<T>(path: string, options?: NetworkRequestOptions): Promise<NetworkResponse<T>>;
	patch<T>(path: string, options?: NetworkRequestOptions): Promise<NetworkResponse<T>>;
	delete<T>(path: string, options?: NetworkRequestOptions): Promise<NetworkResponse<T>>;
}

// Base Dio-like Network Service Implementation
abstract class AxiosNetworkService implements NetworkService {
	protected axios: AxiosInstance;

	constructor(axios: AxiosInstance) {
		this.axios = axios;
	}

	get axiosInstance(): AxiosInstance {
		return this.axios;
	}

	protected defaultValidateStatus(status: number | undefined): boolean {
		return status !== undefined && status >= 200 && status < 300;
	}

	protected toNetworkResponse<T>(response: AxiosResponse<T>): NetworkResponse<T> {
		return {
			body: response.data,
			statusCode: response.status,
			headers: response.headers,
		};
	}

	async get<T>(path: string, options?: NetworkRequestOptions): Promise<NetworkResponse<T>> {
		const response = await this.axios.get<T>(path, {
			params: options?.queryParameters,
			data: options?.data,
			onDownloadProgress: options?.onReceiveProgress,
			cancelToken: options?.cancelToken,
			headers: options?.headers,
			responseType: options?.responseType,
			validateStatus: options?.validateStatus || this.defaultValidateStatus,
			timeout: options?.receiveTimeout,
			...options?.extra,
		});

		return this.toNetworkResponse(response);
	}

	async post<T>(path: string, options?: NetworkRequestOptions): Promise<NetworkResponse<T>> {
		const response = await this.axios.post<T>(path, options?.data, {
			params: options?.queryParameters,
			onUploadProgress: options?.onSendProgress,
			onDownloadProgress: options?.onReceiveProgress,
			cancelToken: options?.cancelToken,
			headers: options?.headers,
			responseType: options?.responseType,
			validateStatus: options?.validateStatus || this.defaultValidateStatus,
			timeout: options?.receiveTimeout || options?.sendTimeout,
			...options?.extra,
		});

		return this.toNetworkResponse(response);
	}

	async put<T>(path: string, options?: NetworkRequestOptions): Promise<NetworkResponse<T>> {
		const response = await this.axios.put<T>(path, options?.data, {
			params: options?.queryParameters,
			onUploadProgress: options?.onSendProgress,
			onDownloadProgress: options?.onReceiveProgress,
			cancelToken: options?.cancelToken,
			headers: options?.headers,
			responseType: options?.responseType,
			validateStatus: options?.validateStatus || this.defaultValidateStatus,
			timeout: options?.receiveTimeout || options?.sendTimeout,
			...options?.extra,
		});

		return this.toNetworkResponse(response);
	}

	async patch<T>(path: string, options?: NetworkRequestOptions): Promise<NetworkResponse<T>> {
		const response = await this.axios.patch<T>(path, options?.data, {
			params: options?.queryParameters,
			onUploadProgress: options?.onSendProgress,
			onDownloadProgress: options?.onReceiveProgress,
			cancelToken: options?.cancelToken,
			headers: options?.headers,
			responseType: options?.responseType,
			validateStatus: options?.validateStatus || this.defaultValidateStatus,
			timeout: options?.receiveTimeout || options?.sendTimeout,
			...options?.extra,
		});

		return this.toNetworkResponse(response);
	}

	async delete<T>(path: string, options?: NetworkRequestOptions): Promise<NetworkResponse<T>> {
		const response = await this.axios.delete<T>(path, {
			params: options?.queryParameters,
			data: options?.data,
			cancelToken: options?.cancelToken,
			headers: options?.headers,
			responseType: options?.responseType,
			validateStatus: options?.validateStatus || this.defaultValidateStatus,
			timeout: options?.receiveTimeout,
			...options?.extra,
		});

		return this.toNetworkResponse(response);
	}

	config(options: { baseURL?: string; timeout?: number }): void {
		if (options.baseURL) {
			this.axios.defaults.baseURL = options.baseURL;
		}
		if (options.timeout !== undefined) {
			this.axios.defaults.timeout = options.timeout;
		}
	}
}

// Auth Network Service with Authentication
export class AuthNetworkService extends AxiosNetworkService {
	private static _instance: AuthNetworkService | null = null;
	private baseDio: AxiosInstance | null = null;

	private constructor(axios: AxiosInstance) {
		super(axios);
		this.baseDio = axios;
		this.setupInterceptors();
	}

	private static createAxiosInstance(): AxiosInstance {
		const axios = AuthNetworkService._instance?.baseDio ? AuthNetworkService._instance.baseDio : this.createBaseAxios();

		return axios;
	}

	private static createBaseAxios(): AxiosInstance {
		return axios.create({
			baseURL: GLOBAL_CONFIG.apiBaseUrl + `/${GLOBAL_CONFIG.apiVersion}`,
			timeout: 50000,
			headers: { "Content-Type": "application/json;charset=utf-8" },
		});
	}

	private setupInterceptors(): void {
		// Setup auth interceptor with retry capability
		AuthInterceptor.setup(this.axios, {
			retryDioBuilder: () => AuthNetworkService.createBaseAxios(),
		});

		// Response interceptor for result handling
		this.axios.interceptors.response.use(
			(res: AxiosResponse) => {
				if (!res.data) throw new Error(t("sys.api.apiRequestFailed"));
				const { status, data, message } = res.data;
				if (status === ResultStatus.SUCCESS) {
					return { ...res, data };
				}
				throw new Error(message || t("sys.api.apiRequestFailed"));
			},
			(error: AxiosError) => {
				// Don't show error toast for 401 (handled by auth interceptor)
				if (error.response?.status !== 401) {
					const { message } = error || {};
					const errMsg = message || t("sys.api.errorMessage");
					toast.error(errMsg, { position: "top-center" });
				}
				return Promise.reject(error);
			},
		);
	}

	static getInstance(): AuthNetworkService {
		if (!AuthNetworkService._instance) {
			const axiosInstance = this.createAxiosInstance();
			AuthNetworkService._instance = new AuthNetworkService(axiosInstance);
		}
		return AuthNetworkService._instance;
	}

	static resetInstance(): void {
		AuthNetworkService._instance = null;
	}
}

// No-Auth Network Service (for public endpoints)
export class NoAuthNetworkService extends AxiosNetworkService {
	private static _instance: NoAuthNetworkService | null = null;

	private constructor(axios: AxiosInstance) {
		super(axios);
		this.setupInterceptors();
	}

	private setupInterceptors(): void {
		// Response interceptor without auth handling
		this.axios.interceptors.response.use(
			(res: AxiosResponse) => {
				if (!res.data) throw new Error(t("sys.api.apiRequestFailed"));
				const { status, data } = res;
				if (status === ResultStatus.SUCCESS) {
					return { ...res, data };
				}
				throw new Error(data?.message || t("sys.api.apiRequestFailed"));
			},
			(error: AxiosError) => {
				const { message } = error || {};
				const errMsg = message || t("sys.api.errorMessage");
				toast.error(errMsg, { position: "top-center" });
				return Promise.reject(error);
			},
		);
	}

	static getInstance(): NoAuthNetworkService {
		if (!NoAuthNetworkService._instance) {
			const axiosInstance = axios.create({
				baseURL: GLOBAL_CONFIG.apiBaseUrl + `/${GLOBAL_CONFIG.apiVersion}`,
				timeout: 50000,
				headers: { "Content-Type": "application/json;charset=utf-8" },
			});
			NoAuthNetworkService._instance = new NoAuthNetworkService(axiosInstance);
		}
		return NoAuthNetworkService._instance;
	}

	static resetInstance(): void {
		NoAuthNetworkService._instance = null;
	}
}

// Custom Network Service Factory
export class CustomNetworkService extends AxiosNetworkService {
	static create(axios: AxiosInstance): CustomNetworkService {
		return new CustomNetworkService(axios);
	}
}
