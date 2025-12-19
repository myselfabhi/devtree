import Link from "next/link";

export default function Home() {
	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
			<div className="max-w-4xl mx-auto px-4 text-center">
				<h1 className="text-5xl font-bold text-gray-900 mb-4">
					Create Your Link Page
				</h1>
				<p className="text-xl text-gray-600 mb-8">
					Share all your links in one beautiful page
				</p>
				<div className="flex gap-4 justify-center">
					<Link
						href="/signup"
						className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
					>
						Get Started
					</Link>
					<Link
						href="/login"
						className="px-6 py-3 bg-white text-blue-600 font-medium rounded-lg border border-blue-600 hover:bg-blue-50 transition-colors"
					>
						Sign In
					</Link>
				</div>
			</div>
		</div>
	);
}