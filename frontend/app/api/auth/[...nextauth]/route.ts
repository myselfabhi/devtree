import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

export const authOptions: NextAuthOptions = {
	providers: [
		CredentialsProvider({
			name: "Credentials",
			credentials: {
				email: { label: "Email", type: "email" },
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials) {
				if (!credentials?.email || !credentials?.password) {
					return null;
				}

				try {
					const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							email: credentials.email,
							password: credentials.password,
						}),
					});

					const data = await res.json();

					if (!res.ok || !data.success) {
						return null;
					}

					// Return user object that will be stored in JWT
					return {
						id: data.data.user.id,
						email: data.data.user.email,
						name: data.data.user.name,
						token: data.data.token, // Store token for API calls
					};
				} catch (error) {
					console.error("Auth error:", error);
					return null;
				}
			},
		}),
	],
	pages: {
		signIn: "/login",
	},
	session: {
		strategy: "jwt",
	},
	callbacks: {
		async jwt({ token, user }) {
			// Store user data and token in JWT
			if (user) {
				token.id = user.id;
				token.email = user.email;
				token.name = user.name;
				token.accessToken = (user as any).token;
			}
			return token;
		},
		async session({ session, token }) {
			// Send user data to client
			if (token) {
				session.user = {
					id: token.id as string,
					email: token.email as string,
					name: token.name as string,
				};
				session.accessToken = token.accessToken as string;
			}
			return session;
		},
	},
	secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };




