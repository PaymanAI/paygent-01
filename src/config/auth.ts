export const API_CONFIG = {
	host: "https://agent.payman.dev/api",
} as const;

export const AUTH_CONFIG = {
	clientId: "pm-test-8BKTzvkiZSmrXpteo9MOgvIL",
	clientSecret:
		"i6rec86x5AdK-NTRnaUNuTuXHYk2dSK_KNhvmz4BUp_g4aT26XjwZivjYDiIgaPN",
	tokenEndpoint: `${API_CONFIG.host}/oauth2/token`,
} as const;
