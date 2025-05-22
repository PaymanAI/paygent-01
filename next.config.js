/** @type {import('next').NextConfig} */
const nextConfig = {
	webpack: (config, { isServer }) => {
		if (!isServer) {
			// Don't resolve 'node:buffer' on the client side
			config.resolve.fallback = {
				...config.resolve.fallback,
				buffer: false,
				crypto: false,
				stream: false,
				util: false,
				url: false,
				http: false,
				https: false,
				zlib: false,
				path: false,
				fs: false,
				net: false,
				tls: false,
				child_process: false,
				os: false,
				assert: false,
				constants: false,
				module: false,
			};
		}
		return config;
	},
};

module.exports = nextConfig;
