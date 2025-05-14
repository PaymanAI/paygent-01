import { AUTH_CONFIG } from "../config/auth";

export async function exchangeCodeForToken(code: string) {
	console.log("Auth Utils: Starting token exchange with code:", code);
	const credentials = btoa(
		`${AUTH_CONFIG.clientId}:${AUTH_CONFIG.clientSecret}`,
	);
	console.log("Auth Utils: Using client ID:", AUTH_CONFIG.clientId);

	const response = await fetch(
		`${AUTH_CONFIG.tokenEndpoint}?grant_type=authorization_code&code=${code}`,
		{
			method: "POST",
			headers: {
				Authorization: `Basic ${credentials}`,
				"Content-Type": "application/json",
			},
		},
	);

	if (!response.ok) {
		const errorText = await response.text();
		console.error("Auth Utils: Token exchange failed:", {
			status: response.status,
			statusText: response.statusText,
			error: errorText,
		});
		throw new Error("Failed to exchange code for token");
	}

	const data = await response.json();
	console.log("Auth Utils: Token exchange successful");
	return data;
}
