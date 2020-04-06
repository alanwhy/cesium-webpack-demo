const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const cesiumSource = "node_modules/cesium/Source";
const cesiumWorkers = "../Build/Cesium/Workers";
const CopyWebpackPlugin = require("copy-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
  context: __dirname,
  entry: {
    app: "./src/index.js",
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist"),
    // needed to compile mutiline strings in Cesium
    sourcePrefix: "",
  },
  amd: {
    // enable webpack-friendly use of require in Cesium
    toUrlUndefined: true,
  },
  node: {
    // Resolve node module use of fs
    fs: "empty",
  },
  resolve: {
    alias: {
      // Cesium module name
      cesium: path.resolve(__dirname, cesiumSource),
    },
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(png|gif|jpg|jpeg|svg|xml|json)$/,
        use: ["url-loader"],
      },
      {
        test: /\.js$/,
        enforce: "pre",
        include: path.resolve(__dirname, cesiumSource),
        use: [
          {
            loader: "strip-pragma-loader",
            options: {
              pragmas: {
                debug: false,
              },
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "src/index.html",
    }),
    // copy Cesium Assets,Widgets,and Workers to a static directory
    new CopyWebpackPlugin([
      {
        from: path.join(cesiumSource, cesiumWorkers),
        to: "Workers",
      },
    ]),
    new CopyWebpackPlugin([
      {
        from: path.join(cesiumSource, "Assets"),
        to: "Assets",
      },
    ]),
    new CopyWebpackPlugin([
      {
        from: path.join(cesiumSource, "Widgets"),
        to: "Widgets",
      },
    ]),
    new webpack.DefinePlugin({
      // define relative base path in cesium fro loading assets
      CESIUM_BASE_URL: JSON.stringify(""),
    }),
  ],
  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          name: "commons",
          chunks: "initial",
          minChunks: 2,
        },
      },
    },
    minimizer: [new TerserPlugin()],
  },
  devServer: {
    contentBase: path.join(__dirname, "dist"),
  },
  devtool: "eval",
};
