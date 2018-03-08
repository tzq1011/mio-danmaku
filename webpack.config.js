const path = require("path");

module.exports = {
  mode: "development",
  entry: "./src/index.ts",
  output: {
    path: path.join(__dirname, "dist"),
    filename: "mio-danmaku.js",
    library: "mioDanmaku",
    libraryTarget: "umd",
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"]
  },
  module: {
    rules: [
      { test: /\.tsx?$/, use: "ts-loader" }
    ]
  },
  devtool: "inline-source-map",
  devServer: {
    port: 9000,
    contentBase: path.join(__dirname, "examples"),
  }
};
