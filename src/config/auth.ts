export const API_CONFIG = {
	host: "https://agent.payman.dev/api",
} as const;

export const AUTH_CONFIG = {
	clientId: "pm-test-uRS7il77lAQftrXicg1CJoRF",
	clientSecret:
		"vOBvp3woD1_5c_xpMolwX_ID9tgYXfpOadMB0-AdLE1vMQ-pZYXmPFm-Sj0RP-5Y",
	tokenEndpoint: `${API_CONFIG.host}/oauth2/token`,
} as const;
