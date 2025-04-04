/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
    container:{
      center: true,
    },
    colors: {
      "correct-answer": "oklch(var(--correct-answer) / <alpha-value>)",
      "incorrect-answer": "oklch(var(--incorrect-answer) / <alpha-value>)",
      "valid-answer": "oklch(var(--valid-answer) / <alpha-value>)"
    },
    fontFamily: {
      "primary": ['Poppins', 'Helvetica', 'Arial', 'sans-serif']
    }
  },
  plugins: [
    require('daisyui'),
  ],
  daisyui: {
    styled: true,
    themes: [{dark: {
      ...require("daisyui/src/theming/themes")["dark"],
      "correct-answer": "#32a852",
      "incorrect-answer": "#a84032",
      "valid-answer": "#325ea8"
    }}],
  },
}

