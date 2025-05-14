import { NextResponse } from "next/server";
import { exchangeCodeForToken } from "@/utils/auth";

export async function POST(request: Request) {
	try {
		const { code } = await request.json();
		console.log("API Route: Received code:", code);

		if (!code) {
			console.log("API Route: No code provided");
			return NextResponse.json(
				{ error: "Authorization code is required" },
				{ status: 400 },
			);
		}

		console.log("API Route: Exchanging code for token...");
		const tokenData = await exchangeCodeForToken(code);
		console.log("API Route: Token exchange successful:", tokenData);
		return NextResponse.json(tokenData);
	} catch (error) {
		console.error("API Route: Error exchanging code for token:", error);
		return NextResponse.json(
			{ error: "Failed to exchange code for token" },
			{ status: 500 },
		);
	}
}
