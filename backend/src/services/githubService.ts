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

interface GoMod {
	module: string;
	goVersion?: string;
	packages: string[]; // Dependencies from go.mod
}

interface CargoToml {
	package?: {
		name?: string;
	};
	dependencies?: Record<string, string>;
}

interface PomXml {
	project?: {
		groupId?: string;
		artifactId?: string;
		properties?: {
			"maven.compiler.source"?: string;
			"java.version"?: string;
		};
		dependencies?: {
			dependency?: Array<{
				groupId?: string;
				artifactId?: string;
			}>;
		};
	};
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
	
	// Go packages
	"github.com/gin-gonic/gin": "Gin",
	"github.com/gorilla/mux": "Gorilla",
	"github.com/labstack/echo": "Echo",
	"github.com/fiber": "Fiber",
	
	// Rust crates
	actix: "Actix",
	rocket: "Rocket",
	serde: "Serde",
	tokio: "Tokio",
	
	// Java frameworks
	"org.springframework.boot": "Spring Boot",
	"org.springframework": "Spring",
	
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
	"gin",
	"gorilla",
	"echo",
	"fiber",
	"go",
	"rust",
	"actix",
	"rocket",
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

const GITHUB_API_TOKEN = process.env.GITHUB_API_TOKEN;

function getGitHubHeaders(): Record<string, string> {
	const headers: Record<string, string> = {
		Accept: "application/vnd.github.v3+json",
	};
	
	if (GITHUB_API_TOKEN) {
		headers.Authorization = `token ${GITHUB_API_TOKEN}`;
	}
	
	return headers;
}

async function fetchRepoInfo(owner: string, repo: string): Promise<GitHubRepoInfo> {
	const url = `https://api.github.com/repos/${owner}/${repo}`;
	
	const response = await fetch(url, {
		headers: getGitHubHeaders(),
	});
	
	if (!response.ok) {
		if (response.status === 404) {
			throw new Error("Repository not found");
		}
		if (response.status === 403) {
			// Check rate limit headers
			const remaining = response.headers.get("x-ratelimit-remaining");
			if (remaining === "0") {
				throw new Error("GitHub API rate limit exceeded. Please add GITHUB_API_TOKEN to your environment variables for higher limits.");
			}
			throw new Error("Repository is private or access denied");
		}
		throw new Error(`GitHub API error: ${response.statusText}`);
	}
	
	return response.json() as Promise<GitHubRepoInfo>;
}

async function fetchPackageJsonFromPath(
	owner: string,
	repo: string,
	path: string
): Promise<PackageJson | null> {
	try {
		const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
		
		const response = await fetch(url, {
			headers: getGitHubHeaders(),
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

async function fetchPackageJson(
	owner: string,
	repo: string
): Promise<PackageJson | null> {
	const mergedPackageJson: PackageJson = {
		dependencies: {},
		devDependencies: {},
	};
	let foundAny = false;
	
	// 1. Check root package.json first
	const rootPackageJson = await fetchPackageJsonFromPath(owner, repo, "package.json");
	if (rootPackageJson) {
		if (rootPackageJson.dependencies) {
			mergedPackageJson.dependencies = {
				...mergedPackageJson.dependencies,
				...rootPackageJson.dependencies,
			};
		}
		if (rootPackageJson.devDependencies) {
			mergedPackageJson.devDependencies = {
				...mergedPackageJson.devDependencies,
				...rootPackageJson.devDependencies,
			};
		}
		foundAny = true;
	}
	
	// 2. List root directory to find subdirectories
	try {
		const rootUrl = `https://api.github.com/repos/${owner}/${repo}/contents`;
		const rootResponse = await fetch(rootUrl, {
			headers: getGitHubHeaders(),
		});
		
		if (rootResponse.ok) {
			const rootContents = (await rootResponse.json()) as Array<{
				type: string;
				name: string;
				path: string;
			}>;
			
			// For each directory in root, check if it has a package.json
			for (const item of rootContents) {
				if (item.type === "dir" && item.name !== "node_modules" && item.name !== ".git") {
					const subPackageJson = await fetchPackageJsonFromPath(
						owner,
						repo,
						`${item.path}/package.json`
					);
					
					if (subPackageJson) {
						// Merge dependencies
						if (subPackageJson.dependencies) {
							mergedPackageJson.dependencies = {
								...mergedPackageJson.dependencies,
								...subPackageJson.dependencies,
							};
						}
						
						// Merge devDependencies
						if (subPackageJson.devDependencies) {
							mergedPackageJson.devDependencies = {
								...mergedPackageJson.devDependencies,
								...subPackageJson.devDependencies,
							};
						}
						
						foundAny = true;
					}
				}
			}
		}
	} catch (error) {
		// If we can't list directories, that's okay - we already checked root
		console.error("Failed to list repository contents:", error);
	}
	
	// Return merged package.json if we found any, otherwise null
	return foundAny ? mergedPackageJson : null;
}

async function fetchRequirementsTxt(
	owner: string,
	repo: string
): Promise<RequirementsTxt | null> {
	try {
		const url = `https://api.github.com/repos/${owner}/${repo}/contents/requirements.txt`;
		
		const response = await fetch(url, {
			headers: getGitHubHeaders(),
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

async function fetchGoMod(
	owner: string,
	repo: string
): Promise<GoMod | null> {
	try {
		const url = `https://api.github.com/repos/${owner}/${repo}/contents/go.mod`;
		
		const response = await fetch(url, {
			headers: getGitHubHeaders(),
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
			const packages: string[] = [];
			let module = "";
			let goVersion = "";
			
			for (const line of content.split("\n")) {
				const trimmed = line.trim();
				
				// Parse module declaration
				if (trimmed.startsWith("module ")) {
					module = trimmed.replace(/^module\s+/, "").trim();
				}
				
				// Parse Go version
				if (trimmed.startsWith("go ")) {
					goVersion = trimmed.replace(/^go\s+/, "").trim();
				}
				
				// Parse require statements
				if (trimmed.startsWith("require ") || trimmed.startsWith("\t") || trimmed.startsWith("  ")) {
					const requireLine = trimmed.replace(/^\s*(require\s+)?/, "").trim();
					if (requireLine && !requireLine.startsWith("//") && requireLine.includes("/")) {
						const pkgMatch = requireLine.match(/^([a-zA-Z0-9._/-]+)/);
						if (pkgMatch) {
							packages.push(pkgMatch[1].toLowerCase());
						}
					}
				}
			}
			
			if (module || packages.length > 0) {
				return {
					module,
					goVersion: goVersion || undefined,
					packages,
				};
			}
		}
		
		return null;
	} catch {
		return null;
	}
}

async function fetchCargoToml(
	owner: string,
	repo: string
): Promise<CargoToml | null> {
	try {
		const url = `https://api.github.com/repos/${owner}/${repo}/contents/Cargo.toml`;
		
		const response = await fetch(url, {
			headers: getGitHubHeaders(),
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
			const dependencies: Record<string, string> = {};
			
			// Simple TOML parsing for dependencies section
			let inDependencies = false;
			for (const line of content.split("\n")) {
				const trimmed = line.trim();
				
				if (trimmed === "[dependencies]" || trimmed.startsWith("[dependencies.")) {
					inDependencies = true;
					continue;
				}
				
				if (trimmed.startsWith("[")) {
					inDependencies = false;
					continue;
				}
				
				if (inDependencies && trimmed && !trimmed.startsWith("#")) {
					const match = trimmed.match(/^([a-zA-Z0-9_-]+)\s*=/);
					if (match) {
						dependencies[match[1]] = trimmed.split("=")[1]?.trim() || "";
					}
				}
			}
			
			if (Object.keys(dependencies).length > 0) {
				return { dependencies };
			}
		}
		
		return null;
	} catch {
		return null;
	}
}

async function fetchPomXml(
	owner: string,
	repo: string
): Promise<PomXml | null> {
	try {
		// Check multiple locations
		const paths = ["pom.xml", "backend/pom.xml", "api/pom.xml"];
		
		for (const path of paths) {
			const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
			
			const response = await fetch(url, {
				headers: getGitHubHeaders(),
			});
			
			if (!response.ok) {
				continue;
			}
			
			const data = (await response.json()) as {
				encoding?: string;
				content?: string;
			};
			
			if (data.encoding === "base64" && data.content) {
				const content = Buffer.from(data.content, "base64").toString("utf-8");
				
				// Simple XML parsing for Maven
				const projectMatch = content.match(/<project[^>]*>(.*?)<\/project>/s);
				if (projectMatch) {
					return {
						project: {
							groupId: content.match(/<groupId>([^<]+)<\/groupId>/)?.at(1),
							artifactId: content.match(/<artifactId>([^<]+)<\/artifactId>/)?.at(1),
						},
					};
				}
			}
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
	goMod: GoMod | null,
	cargoToml: CargoToml | null,
	pomXml: PomXml | null,
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
	
	// Extract from Go modules
	if (goMod) {
		techStack.add("Go");
		for (const pkg of goMod.packages) {
			const mapped = TECH_STACK_MAPPING[pkg];
			if (mapped) {
				techStack.add(mapped);
			} else if (pkg.includes("gin-gonic")) {
				techStack.add("Gin");
			} else if (pkg.includes("gorilla/mux")) {
				techStack.add("Gorilla");
			} else if (pkg.includes("labstack/echo")) {
				techStack.add("Echo");
			} else if (pkg.includes("fiber")) {
				techStack.add("Fiber");
			}
		}
	}
	
	// Extract from Rust Cargo.toml
	if (cargoToml && cargoToml.dependencies) {
		techStack.add("Rust");
		for (const crate of Object.keys(cargoToml.dependencies)) {
			const mapped = TECH_STACK_MAPPING[crate.toLowerCase()];
			if (mapped) {
				techStack.add(mapped);
			} else if (crate.includes("actix")) {
				techStack.add("Actix");
			} else if (crate.includes("rocket")) {
				techStack.add("Rocket");
			}
		}
	}
	
	// Extract from Java Maven pom.xml
	if (pomXml && pomXml.project) {
		techStack.add("Java");
		if (pomXml.project.groupId?.includes("spring")) {
			techStack.add("Spring Boot");
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
	
	const [repoInfo, packageJson, requirementsTxt, goMod, cargoToml, pomXml] = await Promise.all([
		fetchRepoInfo(owner, repo),
		fetchPackageJson(owner, repo),
		fetchRequirementsTxt(owner, repo),
		fetchGoMod(owner, repo),
		fetchCargoToml(owner, repo),
		fetchPomXml(owner, repo),
	]);
	
	const techStack = extractTechStack(
		packageJson?.dependencies,
		packageJson?.devDependencies,
		requirementsTxt?.packages,
		goMod,
		cargoToml,
		pomXml,
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

