const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter var", ...defaultTheme.fontFamily.sans],
      },
    },
  },
  purge: {
    enabled: process.env.NODE_ENV === "production",
    content: ["./components/**/*.{js,ts,jsx,tsx}"],
  },
  variants: {},
  plugins: [require("@tailwindcss/forms")],
};
