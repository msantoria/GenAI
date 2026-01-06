import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: '#0f766e',
        secondary: '#0ea5e9'
      }
    }
  },
  plugins: []
};

export default config;
