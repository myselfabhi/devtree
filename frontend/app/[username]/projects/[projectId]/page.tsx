"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Github, Globe, ExternalLink, Star, Clock, Zap, CheckCircle, AlertCircle } from "lucide-react";
import { profileApi, linkApi } from "@/lib/api";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface Profile {
	id: string;
	username: string;
	displayName: string;
	bio?: string;
	avatar?: string;
}

interface Project {
	_id: string;
	title: string;
	url?: string;
	description?: string;
	techStack?: string[];
	role?: "Frontend" | "Backend" | "Full Stack";
	githubUrl?: string;
	screenshotUrl?: string;
	githubStars?: number;
	lastCommitDate?: string;
	lastCommitMessage?: string;
	lighthousePerformance?: number;
	lighthouseAccessibility?: number;
	lighthouseBestPractices?: number;
	lighthouseSEO?: number;
	lighthouseLastRun?: string;
	status?: "live" | "down" | "slow" | "unknown";
}

export default function ProjectDetailPage() {
	const params = useParams();
	const router = useRouter();
	const username = params.username as string;
	const projectId = params.projectId as string;

	const [profile, setProfile] = useState<Profile | null>(null);
	const [project, setProject] = useState<Project | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string>("");

	useEffect(() => {
		if (username && projectId) {
			loadData();
		}
	}, [username, projectId]);

	const loadData = async () => {
		try {
			const [profileRes, linksRes] = await Promise.all([
				profileApi.getPublic(username),
				linkApi.getPublic(username),
			]);

			if (profileRes.success) {
				const profileData = profileRes.data.profile;
				setProfile(profileData);
			}

			if (linksRes.success) {
				const projectData = linksRes.data.links.find(
					(link: Project) => link._id === projectId
				);
				if (projectData) {
					setProject(projectData);
				} else {
					setError("Project not found");
				}
			}
		} catch (err: any) {
			setError(err.message || "Failed to load project");
		} finally {
			setIsLoading(false);
		}
	};

	const handleLinkClick = async () => {
		if (!project?.url) return;

		try {
			await linkApi.track(project._id);
		} catch (err) {
			console.error("Failed to track click:", err);
		}
	};

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
				<LoadingSpinner />
			</div>
		);
	}

	if (error || !profile || !project) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
				<div className="text-center">
					<h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
						{error || "Project Not Found"}
					</h1>
					<button
						onClick={() => router.push(`/${username}`)}
						className="mt-4 px-4 py-2 rounded-lg bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-hover)] transition-colors"
					>
						Back to Profile
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen relative overflow-hidden">
			{project.screenshotUrl && (
		<>
			<div
				className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat scale-110"
				style={{
					backgroundImage: `url(${project.screenshotUrl})`,
				}}
			/>
			<div className="fixed inset-0 z-0 bg-black/25 backdrop-blur-sm" />
		</>
			)}
			{!project.screenshotUrl && (
				<div className="fixed inset-0 z-0 bg-gradient-to-br from-[var(--bg-primary)] via-[var(--bg-secondary)] to-[var(--bg-tertiary)]" />
			)}

			<div className="relative z-10 min-h-screen">
				<div className="container mx-auto px-4 sm:px-6 py-6 sm:py-12 max-w-4xl">
					<motion.button
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						onClick={() => router.push(`/${username}`)}
						className="mb-4 sm:mb-6 flex items-center gap-2 text-[var(--text-primary)] hover:text-[var(--accent-primary)] transition-colors text-sm sm:text-base"
					>
						<ArrowLeft size={18} className="sm:size-5" />
						<span>Back to Profile</span>
					</motion.button>

					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						className="bg-[var(--card-bg)]/90 backdrop-blur-2xl border border-white/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-2xl"
					>
						<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-4">
							<h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--text-primary)]">
								{project.title}
							</h1>
							{project.status && project.status !== "unknown" && (
								<div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold flex-shrink-0 ${
									project.status === "live" 
										? "bg-green-500/20 text-green-400 border border-green-500/30"
										: project.status === "slow"
										? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
										: "bg-red-500/20 text-red-400 border border-red-500/30"
								}`}>
									{project.status === "live" && <CheckCircle size={14} />}
									{project.status === "slow" && <AlertCircle size={14} />}
									{project.status === "down" && <AlertCircle size={14} />}
									<span className="uppercase">{project.status}</span>
								</div>
							)}
						</div>

						{project.description && (
							<p className="text-base sm:text-lg text-[var(--text-secondary)] mb-6 leading-relaxed">
								{project.description}
							</p>
						)}

						{project.techStack && project.techStack.length > 0 && (
							<div className="mb-6">
								<h2 className="text-sm font-semibold text-[var(--text-secondary)] mb-3 uppercase tracking-wide">
									Tech Stack
								</h2>
								<div className="flex flex-wrap gap-2">
									{project.techStack.map((tech, idx) => (
										<span
											key={idx}
											className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] rounded-lg border border-[var(--accent-primary)]/30"
										>
											{tech}
										</span>
									))}
								</div>
							</div>
						)}

						<div className="flex flex-wrap items-center gap-4 mb-6">
							{project.role && (
								<div>
									<span className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide mr-3">
										Role:
									</span>
									<span className="px-4 py-2 text-sm font-semibold rounded-lg border bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] border-[var(--accent-primary)]/30">
										{project.role}
									</span>
								</div>
							)}
						</div>

						{(project.lighthousePerformance !== undefined || project.githubStars !== undefined || project.lastCommitDate) && (
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 pt-6 border-t border-[var(--card-border)]">
								{project.lighthousePerformance !== undefined && (
									<div className="space-y-3">
										<h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide flex items-center gap-2">
											<Zap size={16} />
											Lighthouse Scores
										</h3>
										<div className="grid grid-cols-2 gap-2 sm:gap-3">
											<div className="bg-[var(--bg-secondary)]/50 rounded-lg p-2 sm:p-3">
												<div className="text-xs text-[var(--text-secondary)] mb-1">Performance</div>
												<div className={`text-xl sm:text-2xl font-bold ${
													project.lighthousePerformance >= 90 ? "text-green-400" :
													project.lighthousePerformance >= 50 ? "text-yellow-400" : "text-red-400"
												}`}>
													{project.lighthousePerformance}
												</div>
											</div>
											<div className="bg-[var(--bg-secondary)]/50 rounded-lg p-2 sm:p-3">
												<div className="text-xs text-[var(--text-secondary)] mb-1">Accessibility</div>
												<div className={`text-xl sm:text-2xl font-bold ${
													(project.lighthouseAccessibility || 0) >= 90 ? "text-green-400" :
													(project.lighthouseAccessibility || 0) >= 50 ? "text-yellow-400" : "text-red-400"
												}`}>
													{project.lighthouseAccessibility || "N/A"}
												</div>
											</div>
											<div className="bg-[var(--bg-secondary)]/50 rounded-lg p-2 sm:p-3">
												<div className="text-xs text-[var(--text-secondary)] mb-1">Best Practices</div>
												<div className={`text-xl sm:text-2xl font-bold ${
													(project.lighthouseBestPractices || 0) >= 90 ? "text-green-400" :
													(project.lighthouseBestPractices || 0) >= 50 ? "text-yellow-400" : "text-red-400"
												}`}>
													{project.lighthouseBestPractices || "N/A"}
												</div>
											</div>
											<div className="bg-[var(--bg-secondary)]/50 rounded-lg p-2 sm:p-3">
												<div className="text-xs text-[var(--text-secondary)] mb-1">SEO</div>
												<div className={`text-xl sm:text-2xl font-bold ${
													(project.lighthouseSEO || 0) >= 90 ? "text-green-400" :
													(project.lighthouseSEO || 0) >= 50 ? "text-yellow-400" : "text-red-400"
												}`}>
													{project.lighthouseSEO || "N/A"}
												</div>
											</div>
										</div>
										{project.lighthouseLastRun && (
											<div className="text-xs text-[var(--text-secondary)]">
												Last run: {new Date(project.lighthouseLastRun).toLocaleDateString()}
											</div>
										)}
									</div>
								)}

								{(project.githubStars !== undefined || project.lastCommitDate) && (
									<div className="space-y-3">
										<h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide flex items-center gap-2">
											<Github size={16} />
											GitHub Metrics
										</h3>
										<div className="space-y-3">
											{project.githubStars !== undefined && (
												<div className="bg-[var(--bg-secondary)]/50 rounded-lg p-3 flex items-center gap-3">
													<Star size={18} className="sm:size-5 text-yellow-400 flex-shrink-0" />
													<div className="min-w-0">
														<div className="text-xs text-[var(--text-secondary)]">Stars</div>
														<div className="text-lg sm:text-xl font-bold text-[var(--text-primary)] truncate">
															{project.githubStars.toLocaleString()}
														</div>
													</div>
												</div>
											)}
											{project.lastCommitDate && (
												<div className="bg-[var(--bg-secondary)]/50 rounded-lg p-3">
													<div className="flex items-center gap-2 mb-2">
														<Clock size={16} className="text-[var(--text-secondary)]" />
														<div className="text-xs text-[var(--text-secondary)]">Last Commit</div>
													</div>
													<div className="text-sm font-semibold text-[var(--text-primary)] mb-1">
														{new Date(project.lastCommitDate).toLocaleDateString()}
													</div>
													{project.lastCommitMessage && (
														<div className="text-xs text-[var(--text-secondary)] line-clamp-2">
															{project.lastCommitMessage}
														</div>
													)}
												</div>
											)}
										</div>
									</div>
								)}
							</div>
						)}

						<div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-6 border-t border-[var(--card-border)]">
							{project.githubUrl && (
								<a
									href={project.githubUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-lg bg-[var(--bg-secondary)] hover:bg-[var(--accent-primary)]/10 text-[var(--text-primary)] hover:text-[var(--accent-primary)] transition-colors border border-[var(--card-border)] text-sm sm:text-base"
								>
									<Github size={18} className="sm:size-5" />
									<span className="font-medium">View on GitHub</span>
									<ExternalLink size={14} className="sm:size-4" />
								</a>
							)}
							{project.url && (
								<a
									href={project.url}
									target="_blank"
									rel="noopener noreferrer"
									onClick={handleLinkClick}
									className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-lg bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white transition-colors font-medium text-sm sm:text-base"
								>
									<Globe size={18} className="sm:size-5" />
									<span>Visit Project</span>
									<ExternalLink size={14} className="sm:size-4" />
								</a>
							)}
						</div>
					</motion.div>
				</div>
			</div>
		</div>
	);
}

