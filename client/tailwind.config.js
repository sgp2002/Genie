/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Claude-inspired Color Palette
        'qe': {
          'primary': '#E97749',         // Claude's warm orange
          'primary-dark': '#DC6537',    // Darker orange for hover
          'primary-light': '#F4927C',   // Lighter orange for accents
          'bg-primary': '#1C1C1C',      // Rich dark background
          'bg-secondary': '#2A2A2A',    // Elevated surfaces
          'bg-tertiary': '#3A3A3A',     // Input backgrounds
          'text-primary': '#F5F5F5',    // High contrast text
          'text-secondary': '#CCCCCC',  // Secondary text
          'text-muted': '#999999',      // Muted text
          'accent-blue': '#4A9EFF',     // Softer blue
          'accent-purple': '#A855F7',   // Refined purple
          'accent-orange': '#E97749',   // Match primary
          'accent-red': '#EF4A4A',      // Softer red
          'border': '#404040',          // Subtle borders
          'border-light': '#555555',    // Lighter borders
        }
      },
      fontFamily: {
        'sans': ['Inter', 'ui-sans-serif', 'system-ui'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
