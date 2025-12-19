import Link from "next/link";
import { motion } from "framer-motion";

export default function Home() {
	return (
		<div 
			className="min-h-screen flex items-center justify-center px-4"
			style={{
				background: "linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 50%, var(--bg-tertiary) 100%)",
			}}
		>
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className="max-w-4xl mx-auto text-center"
			>
				<motion.h1
					initial={{ opacity: 0, scale: 0.9 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ delay: 0.2, type: "spring" }}
					className="text-5xl font-bold mb-4"
					style={{ color: "var(--text-primary)" }}
				>
					Create Your Link Page
				</motion.h1>
				<motion.p
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.4 }}
					className="text-xl mb-8"
					style={{ color: "var(--text-secondary)" }}
				>
					Share all your links in one beautiful page
				</motion.p>
				<motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.6 }}
					className="flex gap-4 justify-center"
				>
					<motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
						<Link
							href="/signup"
							className="px-6 py-3 font-medium rounded-lg transition-all shadow-lg"
							style={{
								backgroundColor: "var(--accent-primary)",
								color: "var(--text-primary)",
							}}
							onMouseEnter={(e) => {
								e.currentTarget.style.backgroundColor = "var(--accent-hover)";
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.backgroundColor = "var(--accent-primary)";
							}}
						>
							Get Started
						</Link>
					</motion.div>
					<motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
						<Link
							href="/login"
							className="px-6 py-3 font-medium rounded-lg border transition-all"
							style={{
								backgroundColor: "var(--bg-card)",
								color: "var(--accent-primary)",
								borderColor: "var(--accent-primary)",
							}}
							onMouseEnter={(e) => {
								e.currentTarget.style.backgroundColor = "var(--bg-hover)";
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.backgroundColor = "var(--bg-card)";
							}}
						>
							Sign In
						</Link>
					</motion.div>
				</motion.div>
			</motion.div>
		</div>
	);
}