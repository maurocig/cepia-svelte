import type { Config } from 'tailwindcss';

export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],

	theme: {
		extend: {
			fontFamily: {
				quicksand: ['Quicksand Variable', 'sans-serif']
			}
		}
	},
	plugins: []
} as Config;
