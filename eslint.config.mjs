// eslint.config.mjs
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
    rules: {
      // Tắt cảnh báo về biến không sử dụng (chuyển thành warn)
      "@typescript-eslint/no-unused-vars": "off",

      // Yêu cầu sử dụng @ts-expect-error thay vì @ts-ignore
      "@typescript-eslint/ban-ts-comment": [
        "error",
        {
          "ts-expect-error": "allow-with-description",
          "ts-ignore": false
        }
      ],

      // Tắt cảnh báo về any (tùy chọn)
      "@typescript-eslint/no-explicit-any": "off"
    }
  },
];

export default eslintConfig;