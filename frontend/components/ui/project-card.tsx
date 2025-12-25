"use client";

import { motion } from "framer-motion";
import { ExternalLink, Github, Globe } from "lucide-react";

interface ProjectCardProps {
	title: string;
	description?: string;
	techStack?: string[];
	role?: "Frontend" | "Backend" | "Full Stack";
	status?: "live" | "down" | "slow" | "unknown";
	githubUrl?: string;
	url?: string;
	onClick?: () => void;
	index: number;
}

export function ProjectCard({
	title,
	description,
	techStack = [],
	role,
	status = "unknown",
	githubUrl,
	url,
	onClick,
	index,
}: ProjectCardProps) {
	const getStatusColor = () => {
		switch (status) {
			case "live":
				return "bg-green-500/20 text-green-500 border-green-500/30";
			case "down":
				return "bg-red-500/20 text-red-500 border-red-500/30";
			case "slow":
				return "bg-amber-500/20 text-amber-500 border-amber-500/30";
			default:
				return "bg-gray-500/20 text-gray-500 border-gray-500/30";
		}
	};

	const getStatusText = () => {
		switch (status) {
			case "live":
				return "Live";
			case "down":
				return "Down";
			case "slow":
				return "Slow";
			default:
				return "Unknown";
		}
	};

	const getRoleColor = () => {
		switch (role) {
			case "Frontend":
				return "bg-blue-500/20 text-blue-500 border-blue-500/30";
			case "Backend":
				return "bg-purple-500/20 text-purple-500 border-purple-500/30";
			default:
				return "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-indigo-500 border-indigo-500/30";
		}
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.6 + index * 0.1 }}
			whileHover={{ scale: 1.02, y: -4 }}
			className="group relative bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-5 sm:p-6 shadow-lg hover:shadow-xl transition-all"
		>
			<div className="flex items-start justify-between gap-4 mb-4">
				<div className="flex-1 min-w-0">
					<h3 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] mb-2 group-hover:text-[var(--accent-purple)] transition-colors">
						{title}
					</h3>
					{description && (
						<p className="text-sm text-[var(--text-secondary)] line-clamp-2 mb-3">
							{description}
						</p>
					)}
				</div>
				{url && (
					<ExternalLink
						size={20}
						className="flex-shrink-0 text-[var(--text-secondary)] group-hover:text-[var(--accent-purple)] transition-colors mt-1"
					/>
				)}
			</div>

			{techStack && techStack.length > 0 && (
				<div className="flex flex-wrap gap-2 mb-4">
					{techStack.slice(0, 6).map((tech, idx) => (
						<span
							key={idx}
							className="px-2.5 py-1 text-xs font-medium bg-[var(--accent-purple)]/10 text-[var(--accent-purple)] rounded-md border border-[var(--accent-purple)]/20"
						>
							{tech}
						</span>
					))}
					{techStack.length > 6 && (
						<span className="px-2.5 py-1 text-xs font-medium text-[var(--text-secondary)]">
							+{techStack.length - 6} more
						</span>
					)}
				</div>
			)}

			<div className="flex items-center justify-between gap-3 pt-4 border-t border-[var(--card-border)]">
				<div className="flex items-center gap-2 flex-wrap">
					{role && (
						<span
							className={`px-3 py-1 text-xs font-semibold rounded-md border ${getRoleColor()}`}
						>
							{role}
						</span>
					)}
					<span
						className={`px-3 py-1 text-xs font-semibold rounded-md border ${getStatusColor()}`}
					>
						{getStatusText()}
					</span>
				</div>

				<div className="flex items-center gap-2">
					{githubUrl && (
						<a
							href={githubUrl}
							target="_blank"
							rel="noopener noreferrer"
							onClick={(e) => e.stopPropagation()}
							className="p-2 rounded-lg bg-[var(--bg-secondary)] hover:bg-[var(--accent-purple)]/10 text-[var(--text-secondary)] hover:text-[var(--accent-purple)] transition-colors"
							aria-label="View on GitHub"
						>
							<Github size={18} />
						</a>
					)}
					{url ? (
						<a
							href={url}
							target="_blank"
							rel="noopener noreferrer"
							onClick={(e) => {
								e.stopPropagation();
								if (onClick) onClick();
							}}
							className="px-4 py-2 rounded-lg bg-[var(--accent-purple)] hover:bg-[var(--accent-purple-hover)] text-white transition-colors flex items-center gap-2 font-medium"
							aria-label="Visit project"
						>
							<Globe size={18} />
							<span className="text-sm hidden sm:inline">Visit</span>
						</a>
					) : githubUrl ? (
						<span className="text-xs text-[var(--text-secondary)] italic px-3 py-2">
							Not deployed
						</span>
					) : null}
				</div>
			</div>
		</motion.div>
	);
}

