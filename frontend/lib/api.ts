const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

export async function apiRequest(
	endpoint: string,
	options: RequestInit = {},
	token?: string
) {
	const headers: Record<string, string> = {
		"Content-Type": "application/json",
		...(options.headers as Record<string, string> || {}),
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
	create: async (data: { username: string; displayName: string; bio?: string; font?: string; avatar?: string; backgroundImage?: string; colors?: { background?: string; text?: string; button?: string; buttonHover?: string } }, token: string) => {
		return apiRequest("/api/profile", { method: "POST", body: JSON.stringify(data) }, token);
	},
	update: async (data: Partial<{ username: string; displayName: string; bio?: string; avatar?: string; font?: string; backgroundImage?: string; colors?: { background?: string; text?: string; button?: string; buttonHover?: string } }>, token: string) => {
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
	trackView: async (username: string) => {
		return apiRequest(`/api/profile/track/${username}`, { method: "GET" });
	},
};

// Link API
export const linkApi = {
	getAll: async (token: string) => {
		return apiRequest("/api/links", { method: "GET" }, token);
	},
	create: async (data: { title: string; url?: string; description?: string; techStack?: string[]; role?: "Frontend" | "Backend" | "Full Stack"; githubUrl?: string }, token: string) => {
		return apiRequest("/api/links", { method: "POST", body: JSON.stringify(data) }, token);
	},
	update: async (id: string, data: Partial<{ title: string; url: string; description?: string; techStack?: string[]; role?: "Frontend" | "Backend" | "Full Stack"; githubUrl?: string }>, token: string) => {
		return apiRequest(`/api/links/${id}`, { method: "PUT", body: JSON.stringify(data) }, token);
	},
	delete: async (id: string, token: string) => {
		return apiRequest(`/api/links/${id}`, { method: "DELETE" }, token);
	},
	validate: async (id: string, token: string) => {
		return apiRequest(`/api/links/${id}/validate`, { method: "POST" }, token);
	},
	getPublic: async (username: string) => {
		return apiRequest(`/api/links/public/${username}`, { method: "GET" });
	},
	track: async (id: string) => {
		return apiRequest(`/api/links/track/${id}`, { method: "GET" });
	},
};

// GitHub API
export const githubApi = {
	fetch: async (githubUrl: string, token: string) => {
		return apiRequest(
			"/api/github/fetch",
			{
				method: "POST",
				body: JSON.stringify({ githubUrl }),
			},
			token
		);
	},
};

// Upload API
export const uploadApi = {
	upload: async (file: File, type: "avatar" | "background", token: string) => {
		const formData = new FormData();
		formData.append("image", file);

		const response = await fetch(`${BACKEND_URL}/api/upload?type=${type}`, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${token}`,
			},
			body: formData,
		});

		const data = await response.json();

		if (!response.ok) {
			throw new Error(data.message || "Upload failed");
		}

		return data;
	},

	delete: async (url: string, token: string) => {
		return apiRequest(
			"/api/upload",
			{
				method: "DELETE",
				body: JSON.stringify({ url }),
			},
			token
		);
	},
};



