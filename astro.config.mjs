import clerk from '@clerk/astro';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	site: 'https://c3.eduardoalvarez.dev',
	output: 'server',
	adapter: vercel(),
	integrations: [clerk(), sitemap(), tailwind(), react()],
	build: {
		assets: '_astro',
	},
});
