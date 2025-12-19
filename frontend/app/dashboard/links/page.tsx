"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
	DndContext,
	closestCenter,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
	DragEndEvent,
} from "@dnd-kit/core";
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	useSortable,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
	Link2,
	GripVertical,
	Pencil,
	Trash2,
	Plus,
	ChevronLeft,
	X,
	ExternalLink,
	ChartBar,
} from "lucide-react";
import { linkApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

const linkSchema = z.object({
	title: z.string().min(1, "Title is required"),
	url: z.string().url("Invalid URL format"),
	icon: z.string().url("Invalid URL format").optional().or(z.literal("")),
	description: z.string().optional(),
});

type LinkFormData = z.infer<typeof linkSchema>;

interface Link {
	_id: string;
	title: string;
	url: string;
	icon?: string;
	description?: string;
	order: number;
	clicks: number;
}

// Sortable Link Item Component
function SortableLinkItem({
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
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: link._id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
	};

	return (
		<motion.div
			ref={setNodeRef}
			style={style}
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: index * 0.05 }}
			whileHover={{ scale: 1.02 }}
			className="bg-[var(--bg-secondary)] border border-[var(--card-border)] rounded-xl p-4 cursor-grab active:cursor-grabbing"
		>
			<div className="flex items-start gap-4">
				{/* Drag Handle */}
				<div
					{...attributes}
					{...listeners}
					className="mt-2 text-[var(--text-secondary)] hover:text-[var(--accent-purple)] transition-colors"
				>
					<GripVertical size={20} />
				</div>

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
	const [isReordering, setIsReordering] = useState(false);

	// Configure sensors for drag and drop
	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);

	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm<LinkFormData>({
		resolver: zodResolver(linkSchema),
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
		reset();
		setIsModalOpen(true);
	};

	const openEditModal = (link: Link) => {
		setEditingLink(link);
		reset({
			title: link.title,
			url: link.url,
			icon: link.icon || "",
			description: link.description || "",
		});
		setIsModalOpen(true);
	};

	const onSubmit = async (data: LinkFormData) => {
		try {
			const token = session!.accessToken as string;
			if (editingLink) {
				await linkApi.update(editingLink._id, data, token);
			} else {
				await linkApi.create(data, token);
			}
			setIsModalOpen(false);
			reset();
			loadLinks();
		} catch (err: any) {
			setError(err.message || "Failed to save link");
		}
	};

	const handleDelete = async (id: string) => {
		if (!confirm("Are you sure you want to delete this link?")) {
			return;
		}

		try {
			await linkApi.delete(id, session!.accessToken as string);
			loadLinks();
		} catch (err: any) {
			setError(err.message || "Failed to delete link");
		}
	};

	const handleDragEnd = async (event: DragEndEvent) => {
		const { active, over } = event;

		if (!over || active.id === over.id) {
			return;
		}

		const oldIndex = links.findIndex((link) => link._id === active.id);
		const newIndex = links.findIndex((link) => link._id === over.id);

		if (oldIndex === -1 || newIndex === -1) {
			return;
		}

		// Optimistically update UI
		const newLinks = arrayMove(links, oldIndex, newIndex);
		setLinks(newLinks);
		setIsReordering(true);

		try {
			// Extract link IDs in new order
			const linkIds = newLinks.map((link) => link._id);
			const response = await linkApi.reorder(
				linkIds,
				session!.accessToken as string
			);

			if (response.success) {
				// Update with server response (includes updated order values)
				setLinks(response.data.links);
			} else {
				// Revert on error
				loadLinks();
				setError("Failed to reorder links. Please try again.");
			}
		} catch (err: any) {
			// Revert on error
			loadLinks();
			setError(err.message || "Failed to reorder links");
		} finally {
			setIsReordering(false);
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
				<div className="container mx-auto px-4 py-4 flex justify-between items-center">
					<div className="flex items-center gap-4">
						<Button
							variant="ghost"
							onClick={() => router.push("/dashboard")}
							className="text-[var(--text-secondary)] hover:text-[var(--accent-purple)]"
						>
							<ChevronLeft size={24} />
						</Button>
						<div className="flex items-center gap-2">
							<Link2 className="text-[var(--accent-purple)]" size={28} />
							<span className="text-xl font-semibold text-[var(--text-primary)]">
								Manage Links
							</span>
						</div>
					</div>
					<Button onClick={openCreateModal}>
						<Plus size={20} className="mr-2" />
						Add Link
					</Button>
				</div>
			</motion.nav>

			<div className="container mx-auto px-4 py-8 max-w-4xl">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="mb-8"
				>
					<h1 className="text-3xl mb-2 text-[var(--text-primary)] font-bold">
						Your Links
					</h1>
					<p className="text-[var(--text-secondary)]">
						Drag to reorder • Click to edit • {links.length} active links
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
							{isReordering && (
								<div className="mb-4 px-4 py-2 bg-[var(--accent-purple)]/10 border border-[var(--accent-purple)]/20 rounded-lg text-sm text-[var(--accent-purple)]">
									Reordering links...
								</div>
							)}

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
								<DndContext
									sensors={sensors}
									collisionDetection={closestCenter}
									onDragEnd={handleDragEnd}
								>
									<SortableContext
										items={links.map((link) => link._id)}
										strategy={verticalListSortingStrategy}
									>
										<div className="space-y-3">
											{links.map((link, index) => (
												<SortableLinkItem
													key={link._id}
													link={link}
													onEdit={openEditModal}
													onDelete={handleDelete}
													index={index}
												/>
											))}
										</div>
									</SortableContext>
								</DndContext>
							)}

							{links.length > 1 && (
								<div className="mt-4 px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--card-border)] rounded-lg text-xs text-[var(--text-secondary)]">
									💡 Drag the handle (☰) to reorder your links
								</div>
							)}
						</CardContent>
					</Card>
				</motion.div>
			</div>

			{/* Add/Edit Modal */}
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
							className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 max-w-lg w-full shadow-2xl"
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
									label="URL"
									placeholder="https://example.com"
									error={errors.url?.message}
								/>

								<Input
									{...register("icon")}
									type="url"
									label="Icon URL (Optional)"
									placeholder="https://example.com/icon.png"
									error={errors.icon?.message}
								/>

								<Textarea
									{...register("description")}
									label="Description (Optional)"
									placeholder="Brief description of this link..."
									rows={3}
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
		</div>
	);
}
