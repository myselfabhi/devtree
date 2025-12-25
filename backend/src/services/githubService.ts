interface GitHubRepoInfo {
	name: string;
	description: string | null;
	topics: string[];
	html_url: string;
}

interface PackageJson {
	name?: string;
	dependencies?: Record<string, string>;
	devDependencies?: Record<string, string>;
	peerDependencies?: Record<string, string>;
}

interface RequirementsTxt {
	packages: string[]; // List of package names from requirements.txt
}

interface GitHubFetchResult {
	title: string;
	description: string | null;
	techStack: string[];
	role: "Frontend" | "Backend" | "Full Stack";
	githubUrl: string;
}

const TECH_STACK_MAPPING: Record<string, string> = {
	// Frontend frameworks
	react: "React",
	"react-dom": "React",
	vue: "Vue",
	"@angular/core": "Angular",
	svelte: "Svelte",
	next: "Next.js",
	nuxt: "Nuxt",
	gatsby: "Gatsby",
	remix: "Remix",
	
	// Backend frameworks
	express: "Node.js",
	"express.js": "Node.js",
	fastify: "Node.js",
	koa: "Node.js",
	"@nestjs/core": "NestJS",
	"@nestjs/common": "NestJS",
	fastapi: "FastAPI",
	django: "Django",
	flask: "Flask",
	streamlit: "Streamlit",
	"spring-boot": "Spring Boot",
	"spring-core": "Spring Boot",
	
	// Databases
	pg: "PostgreSQL",
	postgres: "PostgreSQL",
	postgresql: "PostgreSQL",
	mongodb: "MongoDB",
	mongoose: "MongoDB",
	mysql: "MySQL",
	mysql2: "MySQL",
	redis: "Redis",
	ioredis: "Redis",
	prisma: "Prisma",
	typeorm: "TypeORM",
	sequelize: "Sequelize",
	
	// Languages/Runtimes
	typescript: "TypeScript",
	"@types/node": "TypeScript",
	python: "Python",
	java: "Java",
	go: "Go",
	rust: "Rust",
	
	// Python packages
	pandas: "Pandas",
	numpy: "NumPy",
	requests: "Python",
	pytest: "Python",
	"pytest-cov": "Python",
	pdfplumber: "Python",
	gdown: "Python",
	gspread: "Python",
	"google-auth": "Python",
	
	// Cloud/Services
	"@aws-sdk/client-s3": "AWS",
	"@aws-sdk/s3-client": "AWS",
	"@google-cloud/storage": "GCP",
	"azure-storage": "Azure",
	
	// Build tools
	webpack: "Webpack",
	vite: "Vite",
	turbo: "Turborepo",
	
	// UI libraries
	"@radix-ui/react-avatar": "Radix UI",
	"@radix-ui/react-dialog": "Radix UI",
	tailwindcss: "Tailwind CSS",
	"@mui/material": "Material-UI",
	"@chakra-ui/react": "Chakra UI",
};

const FRONTEND_KEYWORDS = [
	"react",
	"vue",
	"angular",
	"svelte",
	"next.js",
	"nuxt",
	"gatsby",
	"remix",
	"tailwind",
	"css",
	"html",
	"frontend",
];

const BACKEND_KEYWORDS = [
	"express",
	"fastapi",
	"django",
	"flask",
	"streamlit",
	"spring",
	"nestjs",
	"node.js",
	"postgres",
	"mongodb",
	"mysql",
	"redis",
	"backend",
	"api",
	"server",
	"python",
];

function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
	try {
		const urlObj = new URL(url);
		if (urlObj.hostname !== "github.com" && urlObj.hostname !== "www.github.com") {
			return null;
		}
		
		const pathParts = urlObj.pathname.split("/").filter(Boolean);
		if (pathParts.length < 2) {
			return null;
		}
		
		return {
			owner: pathParts[0],
			repo: pathParts[1].replace(/\.git$/, ""),
		};
	} catch {
		return null;
	}
}

async function fetchRepoInfo(owner: string, repo: string): Promise<GitHubRepoInfo> {
	const url = `https://api.github.com/repos/${owner}/${repo}`;
	
	const response = await fetch(url, {
		headers: {
			Accept: "application/vnd.github.v3+json",
		},
	});
	
	if (!response.ok) {
		if (response.status === 404) {
			throw new Error("Repository not found");
		}
		if (response.status === 403) {
			throw new Error("Rate limit exceeded or repository is private");
		}
		throw new Error(`GitHub API error: ${response.statusText}`);
	}
	
	return response.json() as Promise<GitHubRepoInfo>;
}

async function fetchPackageJson(
	owner: string,
	repo: string
): Promise<PackageJson | null> {
	try {
		const url = `https://api.github.com/repos/${owner}/${repo}/contents/package.json`;
		
		const response = await fetch(url, {
			headers: {
				Accept: "application/vnd.github.v3+json",
				// Optional: Add GitHub token
			},
		});
		
		if (!response.ok) {
			return null;
		}
		
		const data = (await response.json()) as {
			encoding?: string;
			content?: string;
		};
		
		if (data.encoding === "base64" && data.content) {
			const content = Buffer.from(data.content, "base64").toString("utf-8");
			return JSON.parse(content) as PackageJson;
		}
		
		return null;
	} catch {
		return null;
	}
}

async function fetchRequirementsTxt(
	owner: string,
	repo: string
): Promise<RequirementsTxt | null> {
	try {
		const url = `https://api.github.com/repos/${owner}/${repo}/contents/requirements.txt`;
		
		const response = await fetch(url, {
			headers: {
				Accept: "application/vnd.github.v3+json",
			},
		});
		
		if (!response.ok) {
			return null;
		}
		
		const data = (await response.json()) as {
			encoding?: string;
			content?: string;
		};
		
		if (data.encoding === "base64" && data.content) {
			const content = Buffer.from(data.content, "base64").toString("utf-8");
			const packages = content
				.split("\n")
				.map((line) => {
					const cleanLine = line.split("#")[0].trim();
					if (!cleanLine) return null;
					const match = cleanLine.match(/^([a-zA-Z0-9_-]+[a-zA-Z0-9._-]*)/);
					return match ? match[1].toLowerCase() : null;
				})
				.filter((pkg): pkg is string => pkg !== null);
			
			return { packages };
		}
		
		return null;
	} catch {
		return null;
	}
}

function extractTechStack(
	dependencies: Record<string, string> | undefined,
	devDependencies: Record<string, string> | undefined,
	requirementsPackages: string[] | undefined,
	topics: string[]
): string[] {
	const techStack = new Set<string>();
	
	if (dependencies) {
		for (const dep of Object.keys(dependencies)) {
			const mapped = TECH_STACK_MAPPING[dep.toLowerCase()];
			if (mapped) {
				techStack.add(mapped);
			}
		}
	}
	
	if (devDependencies) {
		for (const dep of Object.keys(devDependencies)) {
			const mapped = TECH_STACK_MAPPING[dep.toLowerCase()];
			if (mapped) {
				techStack.add(mapped);
			}
		}
	}
	
	if (requirementsPackages) {
		for (const pkg of requirementsPackages) {
			const mapped = TECH_STACK_MAPPING[pkg.toLowerCase()];
			if (mapped) {
				techStack.add(mapped);
			} else if (pkg.includes("streamlit")) {
				techStack.add("Streamlit");
			} else if (pkg.includes("flask")) {
				techStack.add("Flask");
			} else if (pkg.includes("django")) {
				techStack.add("Django");
			} else if (pkg.includes("fastapi")) {
				techStack.add("FastAPI");
			}
		}
		if (requirementsPackages.length > 0) {
			techStack.add("Python");
		}
	}

	for (const topic of topics) {
		if (topic.length > 0) {
			const capitalized = topic.charAt(0).toUpperCase() + topic.slice(1);
			techStack.add(capitalized);
		}
	}
	
	return Array.from(techStack).slice(0, 10);
}

function inferRole(techStack: string[]): "Frontend" | "Backend" | "Full Stack" {
	const techStackLower = techStack.map((tech) => tech.toLowerCase());
	
	const hasFrontend = FRONTEND_KEYWORDS.some((keyword) =>
		techStackLower.some((tech) => tech.includes(keyword))
	);
	
	const hasBackend = BACKEND_KEYWORDS.some((keyword) =>
		techStackLower.some((tech) => tech.includes(keyword))
	);
	
	if (hasFrontend && hasBackend) {
		return "Full Stack";
	}
	if (hasFrontend) {
		return "Frontend";
	}
	if (hasBackend) {
		return "Backend";
	}
	
	return "Full Stack";
}

export async function fetchGitHubRepo(githubUrl: string): Promise<GitHubFetchResult> {
	const parsed = parseGitHubUrl(githubUrl);
	if (!parsed) {
		throw new Error("Invalid GitHub URL format");
	}
	
	const { owner, repo } = parsed;
	
	const [repoInfo, packageJson, requirementsTxt] = await Promise.all([
		fetchRepoInfo(owner, repo),
		fetchPackageJson(owner, repo),
		fetchRequirementsTxt(owner, repo),
	]);
	
	const techStack = extractTechStack(
		packageJson?.dependencies,
		packageJson?.devDependencies,
		requirementsTxt?.packages,
		repoInfo.topics || []
	);
	
	const role = inferRole(techStack);
	
	const title = repo
		.replace(/[-_]/g, " ")
		.split(" ")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
	
	return {
		title,
		description: repoInfo.description,
		techStack,
		role,
		githubUrl: repoInfo.html_url,
	};
}

