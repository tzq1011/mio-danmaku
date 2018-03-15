import rollupResolve from "rollup-plugin-node-resolve";
import rollupCommonJS from "rollup-plugin-commonjs";
import rollupTypeScript from "rollup-plugin-typescript";
import rollupBabel from "rollup-plugin-babel";
import rollupUglify from "rollup-plugin-uglify";
import typescript from "typescript";
import { version } from "./package.json";

const banner =`/*!
 * MioDanmaku v${version}
 * https://github.com/tzq1011/mio-danmaku
 * Released under the MIT License.
 */`;

function createOptions(minify = false) {
  const extension = minify ? ".min.js" : ".js";

  const plugins = [
    rollupResolve({ jsnext: true }),
    rollupCommonJS(),
    rollupTypeScript({ typescript }),
    rollupBabel({
      exclude: "node_modules/**",
      runtimeHelpers: true
    })
  ];

  if (minify) {
    plugins.push(rollupUglify({
      output: {
        comments(node, comment) {
          return (
            comment.type === "comment2" &&
            `/*${comment.value}*/` === banner
          );
        }
      }
    }));
  }

  return {
    input: "src/index.ts",
    output: [
      {
        file: `built/bundles/mio-danmaku.umd${extension}`,
        format: "umd",
        name: "mioDanmaku",
        sourcemap: true,
        banner
      },
      {
        file: `built/bundles/mio-danmaku.esm${extension}`,
        format: "es",
        sourcemap: true,
        banner
      }
    ],
    plugins
  };
}

export default [
  createOptions(),
  createOptions(true)
];
