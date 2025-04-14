import { defineConfig } from "cypress";

export default defineConfig({
  component: {
    supportFile: "cypress/support/component.js",
    devServer: {
      framework: "react",
      bundler: "vite",
      viteConfig: {
        root: "C:/Users/nikol/Senior-Design/Frontend", // explicitly set Vite's root to your frontend folder
        server: {
          fs: {
            allow: ["C:/Users/nikol/Senior-Design/Frontend"],
            strict: false,
          },
        },
      },
    },
    specPattern: "cypress/component/**/*.{cy,spec}.{js,jsx,ts,tsx}",
  },
  e2e: {
    baseUrl: "http://localhost:5173",
    specPattern: "cypress/e2e/**/*.{cy,spec}.{js,jsx,ts,tsx}",
    setupNodeEvents(on, config) {
      return config;
    },
  },
});
