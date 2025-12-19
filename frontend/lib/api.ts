const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

export async function apiRequest(
	endpoint: string,
	options: RequestInit = {},
	token?: string
) {
	const headers: HeadersInit = {
		"Content-Type": "application/json",
		...options.headers,
	};

	if (token) {
		headers.Authorization = `Bearer ${token}`;
	}

	const response = await fetch(`${BACKEND_URL}${endpoint}`, {
		...options,
		headers,
	});

	const data = await response.json();

	if (!response.ok) {
		throw new Error(data.message || "Request failed");
	}

	return data;
}

// Profile API
export const profileApi = {
	get: async (token: string) => {
		return apiRequest("/api/profile", { method: "GET" }, token);
	},
	create: async (data: { username: string; displayName: string; bio?: string }, token: string) => {
		return apiRequest("/api/profile", { method: "POST", body: JSON.stringify(data) }, token);
	},
	update: async (data: Partial<{ username: string; displayName: string; bio?: string; avatar?: string }>, token: string) => {
		return apiRequest("/api/profile", { method: "PUT", body: JSON.stringify(data) }, token);
	},
	checkUsername: async (username: string) => {
		return apiRequest(`/api/profile/check/username?username=${encodeURIComponent(username)}`, {
			method: "GET",
		});
	},
	getPublic: async (username: string) => {
		return apiRequest(`/api/profile/${username}`, { method: "GET" });
	},
};

// Link API
export const linkApi = {
	getAll: async (token: string) => {
		return apiRequest("/api/links", { method: "GET" }, token);
	},
	create: async (data: { title: string; url: string; icon?: string; description?: string }, token: string) => {
		return apiRequest("/api/links", { method: "POST", body: JSON.stringify(data) }, token);
	},
	update: async (id: string, data: Partial<{ title: string; url: string; icon?: string; description?: string }>, token: string) => {
		return apiRequest(`/api/links/${id}`, { method: "PUT", body: JSON.stringify(data) }, token);
	},
	delete: async (id: string, token: string) => {
		return apiRequest(`/api/links/${id}`, { method: "DELETE" }, token);
	},
	reorder: async (linkIds: string[], token: string) => {
		return apiRequest("/api/links/reorder", { method: "PUT", body: JSON.stringify({ linkIds }) }, token);
	},
	getPublic: async (username: string) => {
		return apiRequest(`/api/links/public/${username}`, { method: "GET" });
	},
	track: async (id: string) => {
		return apiRequest(`/api/links/track/${id}`, { method: "GET" });
	},
};



