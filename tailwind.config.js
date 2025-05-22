/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./src/**/*.{js,jsx,ts,tsx}"],
	theme: {
		extend: {
			colors: {
				// Beige colors
				beige: "#fdf3eb",
				"beige-dark": "#bc9472",

				// Pink colors
				pink: "#f1c7d6",

				// Yellow colors
				"yellow-light": "#fffbeb",
				"yellow-dark": "#f7f2d7",
				yellow: "#fffc4f",

				// Teal colors
				"teal-dark": "#0a3b44",
				"teal-light": "#ebf4f5",

				// White and off-white
				white: "#ffffff",
				"off-white": "#f9f9fc",

				// Gray scale
				"light-gray": "#e8e8e8",
				"mid-gray": "#a0a0a0",
				"gray-dark": "#5a5a5a",
				"gray-darker": "#313131",
				charcoal: "#1f1f22",
				"deep-charcoal": "#0c0a09",
				black: "#000000",
				navy: "#101828",

				// Indigo colors
				indigo: "#605be5",
				"indigo-light": "#e6e5ff",

				// Purple colors
				"purple-light": "#f0e5ff",
				purple: "#9747ff",

				// Red colors
				"red-light": "#e39696",
				"red-bright": "#995757",
				"red-dark": "#800000",
				red: "#ff0000",

				// Green colors
				"green-light": "#adffac",
				"green-bright": "#12c90f",
				"green-dark": "#13a411",

				// Brown colors
				"dark-chestnut-brown": "#4a1a00",
				"burnt-umber": "#632f12",
			},
			fontSize: {
				"3xs": "0.625rem", // 5 * 0.125rem
				xxs: "0.75rem", // 6 * 0.125rem
				xs: "0.875rem", // 7 * 0.125rem
				sm: "1rem", // 8 * 0.125rem
				md: "1.125rem", // 9 * 0.125rem
				lg: "1.25rem", // 10 * 0.125rem
				xl: "1.375rem", // 11 * 0.125rem
				"2xl": "1.5rem", // 12 * 0.125rem
				"3xl": "1.625rem", // 13 * 0.125rem
				"4xl": "2rem", // 16 * 0.125rem
				"5xl": "3.375rem", // 27 * 0.125rem
			},
			borderRadius: {
				sm: "0.25rem", // 1 * 0.25rem
				md: "0.5rem", // 2 * 0.25rem
				lg: "1rem", // 4 * 0.25rem
				xl: "1.5rem", // 6 * 0.25rem
				"2xl": "2rem", // 8 * 0.25rem
				full: "50vh",
			},
			spacing: {
				"3xs": "0.125rem", // 0.5 * 0.25rem
				"2xs": "0.1875rem", // 0.75 * 0.25rem
				xs: "0.375rem", // 1.5 * 0.25rem
				sm: "0.5rem", // 2 * 0.25rem
				md: "0.75rem", // 3 * 0.25rem
				lg: "1rem", // 4 * 0.25rem
				xl: "1.25rem", // 5 * 0.25rem
				"2xl": "1.5rem", // 6 * 0.25rem
				"3xl": "1.75rem", // 7 * 0.25rem
				"4xl": "2rem", // 8 * 0.25rem
			},
		},
	},
	plugins: [],
};
