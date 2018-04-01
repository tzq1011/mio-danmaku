const path = require("path");
const HTMLPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

const isProduction = process.env.NODE_ENV === "production";

module.exports = {
  mode: isProduction ? "production" : "development",
  entry: {
    style: "./src/index.css",
    script: "./src/index.ts",
  },
  output: {
    path: path.join(__dirname, "dist"),
    filename: isProduction ? "[name]-[chunkhash].js" : "[name].js",
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
  },
  module: {
    rules: [
      { test: /\.tsx?$/, loader: "ts-loader" },
      {
        test: /\.css$/,
        use: [
          { loader: "style-loader" },
          {
            loader: "css-loader",
            options: {
              importLoaders: 1,
              minimize: isProduction,
            }
          },
          { loader: "postcss-loader" },
        ],
      },
    ]
  },
  plugins: [
    new HTMLPlugin({
      template: "./src/index.html",
      inject: false,
      minify:
        isProduction && {
          removeComments: true,
          collapseWhitespace: true,
          conservativeCollapse: true,
        },
    }),
    new CopyPlugin([
      { from: "./src/comments", to: "comments" },
    ]),
  ],
  devServer: {
    inline: false,
    contentBase: false,
  },
};
