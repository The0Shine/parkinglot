import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        paleTurquoise: "#AFEEEE",
        turquoise: "#40E0D0",
        mediumTurquoise: "#48D1CC",
        darkTurquoise: "#00CED1",
        aquamarine: "#7FFFD4",
        darkText: "#333333",
        lightText: "#FFFFFF",
      },
    },
  },
  plugins: [daisyui],
};
