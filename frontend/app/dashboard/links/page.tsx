"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
	Link2,
	Pencil,
	Trash2,
	Plus,
	ChevronLeft,
	X,
	ExternalLink,
	ChartBar,
	AlertTriangle,
	CheckCircle2,
	Loader2,
} from "lucide-react";
import {
	Modal,
	ModalContent,
	ModalHeader,
	ModalTitle,
	ModalDescription,
	ModalFooter,
} from "@/components/ui/modal";
import { linkApi, githubApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

const linkSchema = z.object({
	title: z.string().min(1, "Title is required"),
	url: z.string().url("Invalid hosted URL format").optional().or(z.literal("")),
	description: z.string().optional(),
	techStack: z.array(z.string()).optional(),
	role: z.enum(["Frontend", "Backend", "Full Stack"]).optional(),
	githubUrl: z.string().url("Invalid GitHub URL format").optional().or(z.literal("")),
});

type LinkFormData = z.infer<typeof linkSchema>;

interface Link {
	_id: string;
	title: string;
	url?: string;
	description?: string;
	techStack?: string[];
	role?: "Frontend" | "Backend" | "Full Stack";
	githubUrl?: string;
	status?: "live" | "down" | "slow" | "unknown";
	lastCheckedAt?: Date;
	screenshotUrl?: string;
	order: number;
	clicks: number;
}

// Link Item Component
function LinkItem({
	link,
	onEdit,
	onDelete,
	index,
}: {
	link: Link;
	onEdit: (link: Link) => void;
	onDelete: (id: string) => void;
	index: number;
}) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: index * 0.05 }}
			whileHover={{ scale: 1.02 }}
			className="bg-[var(--bg-secondary)] border border-[var(--card-border)] rounded-xl p-3 sm:p-4 transition-all duration-200"
		>
					<div className="flex items-start gap-3 sm:gap-4">
				{/* Link Info */}
				<div className="flex-1 min-w-0">
					<div className="flex items-start justify-between gap-4 mb-2">
						<div className="flex-1 min-w-0">
							<h3 className="mb-1 truncate text-[var(--text-primary)] font-semibold">
								{link.title}
							</h3>
							<div className="flex items-center gap-2 text-sm text-[var(--accent-purple)] mb-2">
								<ExternalLink size={14} />
								<span className="truncate">{link.url}</span>
							</div>
							{link.description && (
								<p className="text-sm text-[var(--text-secondary)] line-clamp-2">
									{link.description}
								</p>
							)}
							{link.techStack && link.techStack.length > 0 && (
								<div className="flex flex-wrap gap-1 mt-2">
									{link.techStack.map((tech, idx) => (
										<span
											key={idx}
											className="px-2 py-0.5 text-xs bg-[var(--accent-purple)]/20 text-[var(--accent-purple)] rounded-md"
										>
											{tech}
										</span>
									))}
								</div>
							)}
							{link.role && (
								<span className="inline-block mt-2 px-2 py-0.5 text-xs bg-[var(--bg-tertiary)] text-[var(--text-secondary)] rounded-md">
									{link.role}
								</span>
							)}
							{link.githubUrl && (
								<a
									href={link.githubUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex items-center gap-1 mt-2 text-sm text-[var(--accent-purple)] hover:underline"
								>
									<ExternalLink size={14} />
									GitHub
								</a>
							)}
						</div>

						{/* Actions */}
						<div className="flex items-center gap-2 flex-shrink-0">
							<motion.button
								whileHover={{ scale: 1.1 }}
								whileTap={{ scale: 0.9 }}
								onClick={() => onEdit(link)}
								className="p-2 text-[var(--text-secondary)] hover:text-[var(--accent-purple)] transition-colors"
							>
								<Pencil size={18} />
							</motion.button>
							<motion.button
								whileHover={{ scale: 1.1 }}
								whileTap={{ scale: 0.9 }}
								onClick={() => onDelete(link._id)}
								className="p-2 text-[var(--text-secondary)] hover:text-red-500 transition-colors"
							>
								<Trash2 size={18} />
							</motion.button>
						</div>
					</div>

					{/* Stats */}
					<div className="flex items-center gap-4 text-sm">
						<div className="flex items-center gap-1 text-[var(--text-secondary)]">
							<ChartBar size={14} />
							<span>{link.clicks || 0} clicks</span>
						</div>
					</div>
				</div>
			</div>
		</motion.div>
	);
}

export default function LinksPage() {
	const { data: session, status } = useSession();
	const router = useRouter();
	const [links, setLinks] = useState<Link[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingLink, setEditingLink] = useState<Link | null>(null);
	const [error, setError] = useState<string>("");
	const [techStackInput, setTechStackInput] = useState<string>("");
	const [githubUrlInput, setGithubUrlInput] = useState<string>("");
	const [isFetchingGitHub, setIsFetchingGitHub] = useState(false);
	const [showGitHubModal, setShowGitHubModal] = useState(false);
	const [showConfirmModal, setShowConfirmModal] = useState(false);
	const [fetchedData, setFetchedData] = useState<any>(null);
	const [confirmHostedUrl, setConfirmHostedUrl] = useState<string>("");
	const [showMissingUrlModal, setShowMissingUrlModal] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [linkToDelete, setLinkToDelete] = useState<string | null>(null);

	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
		setValue,
	} = useForm<LinkFormData>({
		resolver: zodResolver(linkSchema),
		defaultValues: {
			role: "Full Stack",
			techStack: [],
		},
	});

	useEffect(() => {
		if (status === "unauthenticated") {
			router.push("/login");
			return;
		}

		if (status === "authenticated" && session?.accessToken) {
			loadLinks();
		}
	}, [status, session, router]);

	useEffect(() => {
		if (showConfirmModal) {
			setError("");
		}
	}, [showConfirmModal]);

	const loadLinks = async () => {
		try {
			const response = await linkApi.getAll(session!.accessToken as string);
			if (response.success) {
				setLinks(response.data.links);
			}
		} catch (err: any) {
			setError(err.message || "Failed to load links");
		} finally {
			setIsLoading(false);
		}
	};

	const openCreateModal = () => {
		setEditingLink(null);
		setTechStackInput("");
		setGithubUrlInput("");
		setFetchedData(null);
		setConfirmHostedUrl("");
		setError("");
		reset();
		setShowGitHubModal(true);
		setIsModalOpen(false);
	};

	const openEditModal = (link: Link) => {
		setEditingLink(link);
		setTechStackInput(link.techStack?.join(", ") || "");
		setGithubUrlInput(link.githubUrl || "");
		reset({
			title: link.title,
			url: link.url,
			description: link.description || "",
			techStack: link.techStack || [],
			role: link.role || "Full Stack",
			githubUrl: link.githubUrl || "",
		});
		setIsModalOpen(true);
	};

	const handleConfirmProject = async () => {
		try {
			const token = session!.accessToken as string;
			
			if (!fetchedData) {
				setError("No data to save");
				return;
			}
			
			if (confirmHostedUrl.trim()) {
				try {
					new URL(confirmHostedUrl.trim());
				} catch {
					setError("Invalid URL format. Must start with http:// or https://");
					return;
				}
			}
			
			if (!confirmHostedUrl.trim()) {
				setShowMissingUrlModal(true);
				return;
			}
			
			await saveProject(token);
		} catch (err: any) {
			setError(err.message || "Failed to save project");
		}
	};

	const saveProject = async (token: string) => {
		setError("");
		
		const apiData: any = {
			title: fetchedData.title,
			description: fetchedData.description || undefined,
			techStack: fetchedData.techStack || [],
			role: fetchedData.role || "Full Stack",
			githubUrl: fetchedData.githubUrl || undefined,
		};
		
		if (confirmHostedUrl.trim()) {
			apiData.url = confirmHostedUrl.trim();
		}
		
		await linkApi.create(apiData, token);
		
		setShowConfirmModal(false);
		setShowGitHubModal(false);
		setShowMissingUrlModal(false);
		setFetchedData(null);
		setConfirmHostedUrl("");
		reset();
		loadLinks();
	};

	const onSubmit = async (data: LinkFormData) => {
		try {
			const token = session!.accessToken as string;
			const techStackArray = techStackInput
				.split(",")
				.map((tech) => tech.trim())
				.filter(Boolean);
			
			const apiData = {
				...data,
				techStack: techStackArray.length > 0 ? techStackArray : undefined,
			};
			
			if (editingLink) {
				await linkApi.update(editingLink._id, apiData, token);
			setIsModalOpen(false);
				setTechStackInput("");
			reset();
			loadLinks();
			}
		} catch (err: any) {
			setError(err.message || "Failed to save link");
		}
	};

	const handleFetchGitHub = async () => {
		if (!githubUrlInput.trim()) {
			setError("Please enter a GitHub URL");
			return;
		}

		setIsFetchingGitHub(true);
		setError("");
		
		try {
			const response = await githubApi.fetch(
				githubUrlInput.trim(),
				session!.accessToken as string
			);
			
			if (response.success) {
				setFetchedData(response.data);
				setConfirmHostedUrl("");
				setError("");
				setShowGitHubModal(false);
				setShowConfirmModal(true);
			}
		} catch (err: any) {
			setError(err.message || "Failed to fetch GitHub repository");
		} finally {
			setIsFetchingGitHub(false);
		}
	};

	const handleDeleteClick = (id: string) => {
		setLinkToDelete(id);
		setShowDeleteModal(true);
	};

	const handleDeleteConfirm = async () => {
		if (!linkToDelete) return;
		
		try {
			await linkApi.delete(linkToDelete, session!.accessToken as string);
			setShowDeleteModal(false);
			setLinkToDelete(null);
			loadLinks();
		} catch (err: any) {
			setError(err.message || "Failed to delete link");
			setShowDeleteModal(false);
			setLinkToDelete(null);
		}
	};

	if (status === "loading" || isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
				<LoadingSpinner />
			</div>
		);
	}

	if (!session) {
		return null;
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-[var(--bg-primary)] via-[var(--bg-secondary)] to-[var(--bg-tertiary)]">
			{/* Navigation Bar */}
			<motion.nav
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				className="bg-[var(--card-bg)]/80 backdrop-blur-xl border-b border-[var(--card-border)] sticky top-0 z-50"
			>
				<div className="container mx-auto px-4 py-3 sm:py-4 flex justify-between items-center gap-2">
					<div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
						<Button
							variant="ghost"
							onClick={() => router.push("/dashboard")}
							className="text-[var(--text-secondary)] hover:text-[var(--accent-purple)] flex-shrink-0"
						>
							<ChevronLeft size={20} />
						</Button>
						<div className="flex items-center gap-2 min-w-0">
							<Link2 className="text-[var(--accent-purple)] flex-shrink-0" size={24} />
							<span className="text-base sm:text-xl font-semibold text-[var(--text-primary)] truncate">
								Manage Links
							</span>
						</div>
					</div>
					<Button onClick={openCreateModal} size="sm" className="flex-shrink-0">
						<Plus size={18} className="sm:mr-2" />
						<span className="hidden sm:inline">Add Link</span>
					</Button>
				</div>
			</motion.nav>

			<div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-4xl">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="mb-8"
				>
					<h1 className="text-3xl mb-2 text-[var(--text-primary)] font-bold">
						Your Links
					</h1>
					<p className="text-[var(--text-secondary)]">
						Click to edit • {links.length} active links
					</p>
				</motion.div>

				<AnimatePresence>
					{error && (
						<motion.div
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: 20 }}
							className="mb-4 px-4 py-3 rounded-lg border border-red-500/50 bg-red-500/10 text-red-500"
						>
							{error}
						</motion.div>
					)}
				</AnimatePresence>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.1 }}
				>
					<Card>
						<CardContent className="p-6">
							{links.length === 0 ? (
								<div className="text-center py-12">
									<Link2
										className="mx-auto mb-4 text-[var(--text-secondary)]"
										size={48}
									/>
									<h3 className="mb-2 text-[var(--text-primary)] font-semibold">
										No links yet
									</h3>
									<p className="text-[var(--text-secondary)] mb-6">
										Create your first link to get started
									</p>
									<Button onClick={openCreateModal}>
										<Plus size={20} className="mr-2" />
										Add Your First Link
									</Button>
								</div>
							) : (
								<div className="space-y-3">
									{links.map((link, index) => (
										<LinkItem
											key={link._id}
											link={link}
											onEdit={openEditModal}
											onDelete={handleDeleteClick}
											index={index}
										/>
									))}
								</div>
							)}
						</CardContent>
					</Card>
				</motion.div>
			</div>

			{/* GitHub URL Input Modal */}
			<AnimatePresence>
				{showGitHubModal && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
						onClick={() => {
							setShowGitHubModal(false);
							setGithubUrlInput("");
							setError("");
						}}
					>
						<motion.div
							initial={{ opacity: 0, scale: 0.9, y: 20 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.9, y: 20 }}
							onClick={(e) => e.stopPropagation()}
							className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-4 sm:p-6 max-w-md w-full shadow-2xl"
						>
							<div className="flex items-center justify-between mb-6">
								<h2 className="text-2xl font-bold text-[var(--text-primary)]">
									Connect GitHub Repository
								</h2>
								<button
									onClick={() => {
										setShowGitHubModal(false);
										setGithubUrlInput("");
										setError("");
									}}
									className="text-[var(--text-secondary)] hover:text-[var(--accent-purple)] transition-colors"
								>
									<X size={24} />
								</button>
							</div>

							<div className="space-y-4">
								<Input
									type="url"
									label="GitHub Repository URL"
									placeholder="https://github.com/username/repo"
									value={githubUrlInput}
									onChange={(e) => setGithubUrlInput(e.target.value)}
									onKeyDown={(e) => {
										if (e.key === "Enter") {
											handleFetchGitHub();
										}
									}}
								/>

								<AnimatePresence>
									{error && (
										<motion.div
											initial={{ opacity: 0, y: -10 }}
											animate={{ opacity: 1, y: 0 }}
											exit={{ opacity: 0, y: -10 }}
											className="px-4 py-3 rounded-lg border border-red-500/50 bg-red-500/10 text-red-500 text-sm"
										>
											{error}
										</motion.div>
									)}
								</AnimatePresence>

								<div className="flex gap-3 pt-4">
									<Button
										type="button"
										onClick={handleFetchGitHub}
										disabled={isFetchingGitHub || !githubUrlInput.trim()}
										className="flex-1"
									>
										{isFetchingGitHub ? "Fetching..." : "Fetch from GitHub"}
									</Button>
									<Button
										type="button"
										variant="outline"
										onClick={() => {
											setShowGitHubModal(false);
											setGithubUrlInput("");
											setError("");
										}}
										className="flex-1"
									>
										Cancel
									</Button>
								</div>
							</div>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Confirmation Modal (Read-only with Edit option) */}
			<AnimatePresence>
				{showConfirmModal && fetchedData && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
						onClick={() => {
							setShowConfirmModal(false);
							setFetchedData(null);
							setError(""); // Clear error when closing
						}}
					>
						<motion.div
							initial={{ opacity: 0, scale: 0.9, y: 20 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.9, y: 20 }}
							onClick={(e) => e.stopPropagation()}
							className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-4 sm:p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto"
						>
							<div className="flex items-center justify-between mb-6">
								<h2 className="text-2xl font-bold text-[var(--text-primary)]">
									Confirm Project Details
								</h2>
								<button
									onClick={() => {
										setShowConfirmModal(false);
										setFetchedData(null);
										setError(""); // Clear error when closing
									}}
									className="text-[var(--text-secondary)] hover:text-[var(--accent-purple)] transition-colors"
								>
									<X size={24} />
								</button>
							</div>

							<div className="space-y-4">
								<div>
									<label className="block mb-2 text-[var(--text-secondary)] font-medium text-sm">
										Project Name
									</label>
									<div className="px-4 py-3 rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--text-primary)]">
										{fetchedData.title}
									</div>
								</div>

								<div>
									<label className="block mb-2 text-[var(--text-secondary)] font-medium text-sm">
										Description
									</label>
									<div className="px-4 py-3 rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--text-primary)] min-h-[60px]">
										{fetchedData.description || "No description"}
									</div>
								</div>

								<div>
									<label className="block mb-2 text-[var(--text-secondary)] font-medium text-sm">
										Tech Stack
									</label>
									<div className="px-4 py-3 rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)]">
										<div className="flex flex-wrap gap-2">
											{fetchedData.techStack && fetchedData.techStack.length > 0 ? (
												fetchedData.techStack.map((tech: string, idx: number) => (
													<span
														key={idx}
														className="px-2 py-1 text-xs bg-[var(--accent-purple)]/20 text-[var(--accent-purple)] rounded-md"
													>
														{tech}
													</span>
												))
											) : (
												<span className="text-[var(--text-secondary)] text-sm">No tech stack</span>
											)}
										</div>
									</div>
								</div>

								<div>
									<label className="block mb-2 text-[var(--text-secondary)] font-medium text-sm">
										Role
									</label>
									<div className="px-4 py-3 rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--text-primary)]">
										{fetchedData.role || "Full Stack"}
									</div>
								</div>

								<div>
									<label className="block mb-2 text-[var(--text-secondary)] font-medium text-sm">
										GitHub URL
									</label>
									<div className="px-4 py-3 rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--text-primary)]">
										<a
											href={fetchedData.githubUrl}
											target="_blank"
											rel="noopener noreferrer"
											className="text-[var(--accent-purple)] hover:underline"
										>
											{fetchedData.githubUrl}
										</a>
									</div>
								</div>

								<div>
									<label className="block mb-2 text-[var(--text-secondary)] font-medium text-sm">
										Hosted URL (Optional)
									</label>
									<input
										type="text"
										placeholder="https://example.com"
										value={confirmHostedUrl}
										onChange={(e) => {
											setConfirmHostedUrl(e.target.value);
											setError(""); // Clear error when user types
										}}
										className="flex h-11 w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-purple)] focus-visible:border-transparent"
									/>
									<p className="text-xs text-[var(--text-secondary)] mt-2">
										The live/deployed URL of your project - Leave empty if not deployed yet
									</p>
								</div>

								<AnimatePresence>
									{error && (
										<motion.div
											initial={{ opacity: 0, y: -10 }}
											animate={{ opacity: 1, y: 0 }}
											exit={{ opacity: 0, y: -10 }}
											className="px-4 py-3 rounded-lg border border-red-500/50 bg-red-500/10 text-red-500 text-sm"
										>
											{error}
										</motion.div>
									)}
								</AnimatePresence>

								<div className="flex gap-3 pt-4">
									<Button
										type="button"
										variant="outline"
										onClick={() => {
											setShowConfirmModal(false);
											setIsModalOpen(true);
											reset({
												title: fetchedData.title,
												url: confirmHostedUrl || "",
												description: fetchedData.description || "",
												techStack: fetchedData.techStack || [],
												role: fetchedData.role || "Full Stack",
												githubUrl: fetchedData.githubUrl || "",
											});
											setTechStackInput(fetchedData.techStack?.join(", ") || "");
										}}
										className="flex-1"
									>
										Edit
									</Button>
									<Button
										type="button"
										onClick={handleConfirmProject}
										className="flex-1"
									>
										Confirm
									</Button>
								</div>
							</div>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Add/Edit Modal (for editing existing links) */}
			<AnimatePresence>
				{isModalOpen && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
						onClick={() => setIsModalOpen(false)}
					>
						<motion.div
							initial={{ opacity: 0, scale: 0.9, y: 20 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.9, y: 20 }}
							onClick={(e) => e.stopPropagation()}
							className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-4 sm:p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto"
						>
							<div className="flex items-center justify-between mb-6">
								<h2 className="text-2xl font-bold text-[var(--text-primary)]">
									{editingLink ? "Edit Link" : "Add New Link"}
								</h2>
								<button
									onClick={() => setIsModalOpen(false)}
									className="text-[var(--text-secondary)] hover:text-[var(--accent-purple)] transition-colors"
								>
									<X size={24} />
								</button>
							</div>

							<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
								<div className="w-full p-4 bg-[var(--bg-secondary)] rounded-xl border border-[var(--card-border)]">
									<label className="block mb-2 text-[var(--text-secondary)] font-medium text-sm">
										GitHub Repository (Optional)
									</label>
									<div className="flex gap-2">
										<Input
											type="url"
											placeholder="https://github.com/username/repo"
											value={githubUrlInput}
											onChange={(e) => setGithubUrlInput(e.target.value)}
											className="flex-1"
										/>
										<Button
											type="button"
											onClick={async () => {
												if (!githubUrlInput.trim()) {
													setError("Please enter a GitHub URL");
													return;
												}
												
												setIsFetchingGitHub(true);
												setError("");
												
												try {
													const response = await githubApi.fetch(
														githubUrlInput.trim(),
														session!.accessToken as string
													);
													
													if (response.success) {
														const data = response.data;
														// Auto-populate form fields
														setValue("title", data.title);
														setValue("description", data.description || "");
														setValue("techStack", data.techStack);
														setValue("role", data.role);
														setValue("githubUrl", data.githubUrl);
														setTechStackInput(data.techStack.join(", "));
													}
												} catch (err: any) {
													setError(err.message || "Failed to fetch GitHub repository");
												} finally {
													setIsFetchingGitHub(false);
												}
											}}
											disabled={isFetchingGitHub}
											className="flex-shrink-0"
										>
											{isFetchingGitHub ? "Fetching..." : "Fetch from GitHub"}
										</Button>
									</div>
									<p className="mt-2 text-xs text-[var(--text-secondary)]">
										Enter GitHub repo URL to auto-populate project details
									</p>
								</div>

								<Input
									{...register("title")}
									type="text"
									label="Title"
									placeholder="My Awesome Link"
									error={errors.title?.message}
								/>

								<Input
									{...register("url")}
									type="url"
									label="Hosted URL (Optional)"
									placeholder="https://.com"
									error={errors.url?.message}
								/>
								<p className="text-xs text-[var(--text-secondary)] -mt-2 mb-2">
									The live/deployed URL of your project - Leave empty if not deployed yet
								</p>

								<Textarea
									{...register("description")}
									label="Description (Optional)"
									placeholder="Brief description of this link..."
									rows={3}
								/>

								<div className="w-full">
									<label className="block mb-2 text-[var(--text-secondary)] font-medium text-sm">
										Tech Stack (Optional) - Comma separated
									</label>
									<Input
										type="text"
										placeholder="React, Node.js, PostgreSQL (comma separated)"
										value={techStackInput}
										onChange={(e) => setTechStackInput(e.target.value)}
									/>
								</div>

								<div className="w-full">
									<label className="block mb-2 text-[var(--text-secondary)] font-medium text-sm">
										Role
									</label>
									<select
										{...register("role")}
										className="flex h-11 w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-4 py-3 text-sm text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-purple)] focus-visible:border-transparent"
									>
										<option value="Full Stack">Full Stack</option>
										<option value="Frontend">Frontend</option>
										<option value="Backend">Backend</option>
									</select>
									{errors.role && (
										<p className="mt-1 text-sm text-red-500">
											{errors.role.message}
										</p>
									)}
								</div>

								<Input
									type="url"
									label="GitHub URL (Optional)"
									placeholder="https://github.com/username/repo"
									value={githubUrlInput}
									onChange={(e) => {
										setGithubUrlInput(e.target.value);
										setValue("githubUrl", e.target.value);
									}}
									error={errors.githubUrl?.message}
								/>

								<div className="flex gap-3 pt-4">
									<Button type="submit" className="flex-1">
										{editingLink ? "Update Link" : "Add Link"}
									</Button>
									<Button
										type="button"
										variant="outline"
										onClick={() => setIsModalOpen(false)}
										className="flex-1"
									>
										Cancel
									</Button>
								</div>
							</form>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>

			<Modal open={showMissingUrlModal} onOpenChange={setShowMissingUrlModal}>
				<ModalContent>
					<ModalHeader>
						<div className="flex items-center gap-3">
							<AlertTriangle className="w-6 h-6 text-amber-500" />
							<ModalTitle>No Hosted URL Provided</ModalTitle>
						</div>
					</ModalHeader>
					<div className="px-6 pb-6 pt-2">
						<p className="text-base text-[var(--text-primary)] mb-3">
							A live hosted URL is a blessing for recruiters to see the best proof of your work. 
							It demonstrates your ability to deploy and maintain real applications.
						</p>
						<p className="text-sm text-[var(--text-secondary)]">
							Do you want to continue without a hosted URL?
						</p>
					</div>
					<ModalFooter>
						<Button
							variant="outline"
							onClick={() => setShowMissingUrlModal(false)}
						>
							Cancel
						</Button>
						<Button
							onClick={async () => {
								setShowMissingUrlModal(false);
								await saveProject(session!.accessToken as string);
							}}
						>
							Continue Without URL
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>

			<Modal open={showDeleteModal} onOpenChange={setShowDeleteModal}>
				<ModalContent>
					<ModalHeader>
						<div className="flex items-center gap-3">
							<AlertTriangle className="w-6 h-6 text-red-500" />
							<ModalTitle>Delete Project</ModalTitle>
						</div>
					</ModalHeader>
					<div className="px-6 pb-6 pt-2">
						<p className="text-base text-[var(--text-primary)]">
							Are you sure you want to delete this project? This action cannot be undone.
						</p>
					</div>
					<ModalFooter>
						<Button
							variant="outline"
							onClick={() => {
								setShowDeleteModal(false);
								setLinkToDelete(null);
							}}
						>
							Cancel
						</Button>
						<Button
							onClick={handleDeleteConfirm}
							className="bg-red-600 hover:bg-red-700 text-white"
						>
							Delete
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</div>
	);
}
