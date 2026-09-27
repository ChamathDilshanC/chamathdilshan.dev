import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

const config = [
  { ignores: [".next/**", "out/**", "node_modules/**", "lib/api-types.ts", "public/assets/decoders/**", "artifacts/**", "test-results/**"] },
  ...coreWebVitals,
  ...typescript,
];

export default config;
