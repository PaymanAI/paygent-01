export const API_CONFIG = {
	host: "http://localhost:8100/api",
} as const;

export const AUTH_CONFIG = {
	clientId: "pm-test-2xi-kmgTa875Qj4qbP_REKM0",
	clientSecret:
		"ymtpcv3ffoXuY-735D6qGR05EuHml-u1183tSqQzJ7CjoK6LdSdbAJuZ41YZwlR6",
	tokenEndpoint: `${API_CONFIG.host}/oauth2/token`,
} as const;
