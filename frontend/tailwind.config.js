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

    },
    fontFamily: {
      "primary": ['Poppins', 'Helvetica', 'Arial', 'sans-serif']
    }
  },
  plugins: [
    require('daisyui'),
  ],
  daisyui: {
    themes: ['light'],
  },
}

