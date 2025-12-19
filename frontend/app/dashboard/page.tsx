"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { signOut } from "next-auth/react";

export default function DashboardPage() {
	const { data: session, status } = useSession();
	const router = useRouter();

	useEffect(() => {
		if (status === "unauthenticated") {
			router.push("/login");
		}
	}, [status, router]);

	if (status === "loading") {
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
						<div className="flex items-center">
							<h1 className="text-xl font-semibold">Linktree Dashboard</h1>
						</div>
						<div className="flex items-center space-x-4">
							<span className="text-gray-700">{session.user?.email}</span>
							<button
								onClick={() => signOut()}
								className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
							>
								Sign out
							</button>
						</div>
					</div>
				</div>
			</nav>

			<main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
				<div className="px-4 py-6 sm:px-0">
					<div className="border-4 border-dashed border-gray-200 rounded-lg h-96 p-8">
						<h2 className="text-2xl font-bold mb-4">Welcome, {session.user?.name}!</h2>
						<p className="text-gray-600 mb-4">
							Your dashboard is ready. Profile and link management coming soon.
						</p>
						<div className="space-y-2">
							<p className="text-sm text-gray-500">Email: {session.user?.email}</p>
							<p className="text-sm text-gray-500">User ID: {session.user?.id}</p>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}

