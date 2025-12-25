const GITHUB_API_TOKEN = process.env.GITHUB_API_TOKEN;

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

interface GitHubRepoStats {
	stars: number;
	lastCommitDate: Date;
	lastCommitMessage: string;
}

export async function fetchGitHubMetrics(githubUrl: string): Promise<GitHubRepoStats | null> {
	const parsed = parseGitHubUrl(githubUrl);
	if (!parsed) {
		return null;
	}

	const { owner, repo } = parsed;

	try {
		const headers: Record<string, string> = {
			Accept: "application/vnd.github.v3+json",
		};

		if (GITHUB_API_TOKEN) {
			headers.Authorization = `token ${GITHUB_API_TOKEN}`;
		}

		const [repoResponse, commitsResponse] = await Promise.all([
			fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers }),
			fetch(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=1`, { headers }),
		]);

		if (!repoResponse.ok || !commitsResponse.ok) {
			return null;
		}

		const repoData = (await repoResponse.json()) as { stargazers_count: number };
		const commitsData = (await commitsResponse.json()) as Array<{
			commit: {
				message: string;
				author: { date: string };
			};
		}>;

		if (commitsData.length === 0) {
			return null;
		}

		const lastCommit = commitsData[0];

		return {
			stars: repoData.stargazers_count || 0,
			lastCommitDate: new Date(lastCommit.commit.author.date),
			lastCommitMessage: lastCommit.commit.message.split("\n")[0],
		};
	} catch (error) {
		console.error("Failed to fetch GitHub metrics:", error);
		return null;
	}
}

