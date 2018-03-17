import rollupResolve from "rollup-plugin-node-resolve";
import rollupCommonJS from "rollup-plugin-commonjs";
import rollupTypeScript from "rollup-plugin-typescript2";
import typescript from "typescript";

export default {
  input: "index.ts",
  output: {
    file: "bundle.js",
    format: "iife",
  },
  plugins: [
    rollupResolve({ jsnext: true }),
    rollupCommonJS(),
    rollupTypeScript({ typescript }),
  ]
};
