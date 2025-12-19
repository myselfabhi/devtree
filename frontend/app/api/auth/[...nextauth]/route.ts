import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

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

				// TODO: Call your Express backend API to verify credentials
				// const res = await fetch(`${process.env.BACKEND_URL}/api/auth/login`, {
				//   method: "POST",
				//   body: JSON.stringify(credentials),
				// });
				// const user = await res.json();

				// For now, return null (will implement when backend auth is ready)
				return null;
			},
		}),
	],
	pages: {
		signIn: "/login",
		signUp: "/signup",
	},
	session: {
		strategy: "jwt",
	},
	secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };




