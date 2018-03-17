import rollupResolve from "rollup-plugin-node-resolve";
import rollupCommonJS from "rollup-plugin-commonjs";
import rollupTypeScript from "rollup-plugin-typescript2";
import rollupUglify from "rollup-plugin-uglify";
import typescript from "typescript";
import { version } from "./package.json";

const plugins = [
  rollupResolve({ jsnext: true }),
  rollupCommonJS(),
  rollupTypeScript({
    typescript,
    tsconfigOverride: {
      compilerOptions: { sourceMap: true },
    },
  }),
];

let extension = ".js";

if (process.env.BUILD === "production") {
  plugins.push(rollupUglify({
    output: {
      comments(node, comment) {
        return (
          comment.type === "comment2" &&
          `/*${comment.value}*/` === banner
        );
      },
    }
  }));

  extension = ".min.js";
}

let banner =
`/*!
 * MioDanmaku v${version}
 * https://github.com/tzq1011/mio-danmaku
 * Released under the MIT License.
 */`;

export default {
  input: "src/index.ts",
  output: [
    {
      file: `built/bundles/mio-danmaku.umd${extension}`,
      format: "umd",
      name: "mioDanmaku",
      sourcemap: true,
      banner,
    },
    {
      file: `built/bundles/mio-danmaku.esm${extension}`,
      format: "es",
      sourcemap: true,
      banner,
    }
  ],
  plugins,
};
