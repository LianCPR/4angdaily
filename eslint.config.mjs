import nextConfig from "eslint-config-next";

/** @type {import('eslint').Linter.Config[]} */
const config = [
  ...nextConfig,
  {
    rules: {
      "@next/next/no-img-element": "off",
    },
  },
];

export default config;
