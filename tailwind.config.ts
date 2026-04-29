import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        bebas: ['var(--font-bebas)', 'Impact', 'sans-serif'],
      },
      letterSpacing: {
        'widest2': '0.2em',
      },
    },
  },
  plugins: [],
};
export default config;
