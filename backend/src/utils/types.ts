// Type definitions for API responses

export interface ApiResponse<T = unknown> {
	success: boolean;
	message?: string;
	data?: T;
}

export interface UserResponse {
	id: string;
	email: string;
	name: string;
}

export interface AuthResponse {
	user: UserResponse;
	token: string;
}

