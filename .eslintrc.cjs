const indentUnit = 2

module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2020: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react/jsx-runtime",
    "plugin:react-hooks/recommended",
  ],
  ignorePatterns: [
    ".next",
    "node_modules",
    "dist",
    ".eslintrc.cjs",
  ],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
  },
  settings: {
    react: {
      version: "detect",
    },
  },
  plugins: ["react-refresh"],
  rules: {
    "array-callback-return": "off",
    camelcase: "off",
    "consistent-return": "off",
    eqeqeq: "warn",
    "no-console": "warn",
    "no-alert": "off",
    "no-plusplus": "off",
    "no-restricted-syntax": "off",
    "no-multi-spaces": "error",
    "no-shadow": "off",
    "no-underscore-dangle": "off",
    "no-var": "error",
    radix: "off",
    "no-use-before-define": "off",
    "react-hooks/rules-of-hooks": "error",
    "react/prop-types": "warn",
    "react/jsx-indent": ["warn", indentUnit],
    "react/jsx-indent-props": ["warn", indentUnit],
    indent: ["warn", indentUnit],
    semi: [1, "never"],
    "react/require-default-props": [
      "warn",
      {
        forbidDefaultForRequired: true,
        ignoreFunctionalComponents: true,
      },
    ],
    "template-tag-spacing": ["error", "never"],
    "react/jsx-tag-spacing": "error",
    quotes: ["error", "single"],
    "jsx-quotes": ["error", "prefer-single"],
    "no-trailing-spaces": "error",
    "no-multiple-empty-lines": ["error", { max: 1, maxEOF: 1 }],
    "max-len": ["warn", 150],
    "object-curly-spacing": ["error", "always"],
    "no-unused-vars": "off",
  },
  overrides: [
    {
      files: ["**/*.test.js", "**/*.test.jsx"],
      rules: {
        "react/prop-types": "off",
      },
    },
    {
      files: ["next.config.mjs", "scripts/**/*.js", "pages/api/**/*.js"],
      rules: {
        "no-undef": "off",
      },
    },
  ],
}
