"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { linkApi } from "@/lib/api";

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
}: {
	link: Link;
	onEdit: (link: Link) => void;
	onDelete: (id: string) => void;
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
		<li ref={setNodeRef} style={style} className="p-4 hover:bg-gray-50">
			<div className="flex items-center justify-between">
				<div className="flex items-center flex-1">
					<button
						{...attributes}
						{...listeners}
						className="mr-3 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
						aria-label="Drag to reorder"
					>
						<svg
							className="w-6 h-6"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M4 8h16M4 16h16"
							/>
						</svg>
					</button>
					<div className="flex-1">
						<h3 className="text-lg font-medium">{link.title}</h3>
						<p className="text-sm text-gray-600">{link.url}</p>
						{link.description && (
							<p className="text-sm text-gray-500 mt-1">{link.description}</p>
						)}
						<p className="text-xs text-gray-400 mt-1">{link.clicks} clicks</p>
					</div>
				</div>
				<div className="flex space-x-2">
					<button
						onClick={() => onEdit(link)}
						className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
					>
						Edit
					</button>
					<button
						onClick={() => onDelete(link._id)}
						className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
					>
						Delete
					</button>
				</div>
			</div>
		</li>
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
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-lg">Loading...</div>
			</div>
		);
	}

	if (!session) {
		return null;
	}

	return (
		<div className="min-h-screen bg-gray-50">
			<nav className="bg-white shadow">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between h-16">
						<div className="flex items-center space-x-4">
							<button
								onClick={() => router.push("/dashboard")}
								className="text-gray-600 hover:text-gray-900"
							>
								← Back to Dashboard
							</button>
						</div>
					</div>
				</div>
			</nav>

			<main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
				<div className="px-4 py-6 sm:px-0">
					<div className="flex justify-between items-center mb-6">
						<h2 className="text-2xl font-bold">Your Links</h2>
						<button
							onClick={openCreateModal}
							className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
						>
							+ Add Link
						</button>
					</div>

					{error && (
						<div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
							{error}
						</div>
					)}

					{links.length === 0 ? (
						<div className="bg-white rounded-lg shadow p-8 text-center">
							<p className="text-gray-600 mb-4">No links yet. Create your first link!</p>
							<button
								onClick={openCreateModal}
								className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
							>
								Add Your First Link
							</button>
						</div>
					) : (
						<div className="bg-white shadow rounded-lg overflow-hidden">
							{isReordering && (
								<div className="px-4 py-2 bg-blue-50 border-b border-blue-200 text-sm text-blue-700">
									Reordering links...
								</div>
							)}
							<DndContext
								sensors={sensors}
								collisionDetection={closestCenter}
								onDragEnd={handleDragEnd}
							>
								<SortableContext
									items={links.map((link) => link._id)}
									strategy={verticalListSortingStrategy}
								>
									<ul className="divide-y divide-gray-200">
										{links.map((link) => (
											<SortableLinkItem
												key={link._id}
												link={link}
												onEdit={openEditModal}
												onDelete={handleDelete}
											/>
										))}
									</ul>
								</SortableContext>
							</DndContext>
							{links.length > 1 && (
								<div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
									💡 Drag the handle (☰) to reorder your links
								</div>
							)}
						</div>
					)}
				</div>
			</main>

			{/* Modal */}
			{isModalOpen && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
						<h3 className="text-xl font-bold mb-4">
							{editingLink ? "Edit Link" : "Add New Link"}
						</h3>
						<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-gray-700">Title</label>
								<input
									{...register("title")}
									type="text"
									className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
								/>
								{errors.title && (
									<p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
								)}
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700">URL</label>
								<input
									{...register("url")}
									type="url"
									className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
									placeholder="https://example.com"
								/>
								{errors.url && (
									<p className="mt-1 text-sm text-red-600">{errors.url.message}</p>
								)}
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700">
									Icon URL (Optional)
								</label>
								<input
									{...register("icon")}
									type="url"
									className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
									placeholder="https://example.com/icon.png"
								/>
								{errors.icon && (
									<p className="mt-1 text-sm text-red-600">{errors.icon.message}</p>
								)}
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700">
									Description (Optional)
								</label>
								<textarea
									{...register("description")}
									rows={3}
									className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
								/>
							</div>

							<div className="flex justify-end space-x-3">
								<button
									type="button"
									onClick={() => setIsModalOpen(false)}
									className="px-4 py-2 border border-gray-300 rounded-md"
								>
									Cancel
								</button>
								<button
									type="submit"
									className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
								>
									{editingLink ? "Update" : "Create"}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
}



