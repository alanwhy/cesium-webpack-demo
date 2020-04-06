# Cesium与webpack4.0初始化开发

### 需要的支持储备
- 已经安装好node.js，6版本及更高，并且是LTS版本
- 一个支持webgl的浏览器

### 创建一个webpack项目

1、新建项目文件夹 cesium-webpack-demo

2、在文件夹下打开命令行，输入
```
npm init -y
```
`-y`为默认初始化的配置，可以不加

3、创建好`package.json`文件后，新建src文件夹，创建模版文件 `index.html`和webpack入口文件 `index.js`

index.html
```
<!DOCTYPE html>
<html lang="zh">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>cesium</title>
  </head>
  <body>
    <div id="cesiumContainer"></div>
  </body>
</html>
```
index.js
```
console.log("hello world")
```

4、安装并配置webpack
```
npm i webpack -D
```

在项目根目录下创建`webpack.config.js`的文件，并写入配置
```
const path = require("path");
const webpack = require("webpack");

module.exports = {
  context: __dirname,
  entry: {
    app: "./src/index.js",
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist"),
  },
};
```

此处配置了context环境的基本路径，设置`src/index.js`作为入口文件，并命名为app

5、安装并配置loader
```
npm i style-loader css-loader url-loader -D
```
修改配置
```
const path = require("path");
const webpack = require("webpack");

module.exports = {
  context: __dirname,
  entry: {
    app: "./src/index.js",
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist"),
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
    ],
  },
};
```

6、安装并配置Plugins
```
npm i html-webpack-plugin -D
```
并设置模版
```
const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  context: __dirname,
  entry: {
    app: "./src/index.js",
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist"),
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
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "src/index.html",
    }),
  ],
};
```

7、配置脚本

在`package.json`中新增脚本
```
"scripts": {
    "build": "node_modules/.bin/webpack --config webpack.config.js"
  },
```

> ⚠️注意：配置了node_modules后可以采用项目本身的webpack进行打包操作，如果想使用全局的webpack进行打包，需要执行命令`npm i webpack -g`进行全局安装，修改配置为`webpack --config webpack.config.js`

8、打包测试

输入命令
```
npm run build
```

项目目录下生成新的文件夹dist，其中包含index.html和app.js文件，用浏览器打开index.html，控制台输出hello world

9、安装webpack-dev-server快速提供开发版本查看
```
npm i webpack-dev-server webpack-cli -D
```
在`package.json`中新增脚本
```
"scripts": {
    "build": "node_modules/.bin/webpack --config webpack.config.js",
    "start": "node_modules/.bin/webpack-dev-server --config webpack.config.js --open"
  },
```
在`webpack.config.js`中新增配置
```
const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  context: __dirname,
  entry: {
    app: "./src/index.js",
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist"),
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
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "src/index.html",
    }),
  ],
  devServer: {
    contentBase: path.join(__dirname, "dist"),
  },
};
```
控制台输入
```
npm start
```
浏览器自动打开到`http://localhost:8080`，可以看到控制台输出hello world

10、添加cesium到项目中
```
npm i cesium -D
```

> 注意：cesium是个庞大复杂的库，除了js脚本，还包含了大量的css，image，json等，与其他npm模块不同，cesium没有入口点，需要自行配置，下面我们进行配置，来解决一些cesium的怪癖

在`webpack.config.js`中新增配置
```
const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const cesiumSource = "node_modules/cesium/Source";
const cesiumWorkers = "../Build/Cesium/Workers";

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
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "src/index.html",
    }),
  ],
  devServer: {
    contentBase: path.join(__dirname, "dist"),
  },
};
```

配置说明
- `output.sourcePrefix`：cesium有多行字符串实例，需要用空前缀覆盖这个默认值
- `amd.toUrlUndefined`：AMD webpack用来评估`require`语法版本不符合标准toUrl功能
- `node.fs`：解决`fs`模块的一些第三方使用情况
- `resolve`：为`cesium`新增一个别名

11、拷贝管理cesium的静态文件

引入`copy-webpack-plugin`
```
npm i copy-webpack-plugin -D
```

配置`webpack.config.js`
```
...
const CopyWebpackPlugin = require("copy-webpack-plugin");
...

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

  ...
```

12、程序引入ceisum的方式

CommonJS

```
// 引入整库
var Cesium = require("cesium/Cesium")
var viewer = new Cesium.Viewer('cesiumContainer')

// 按需引入
var Color = require("cesium/Core/Color")
var color = Color.fromRandom()
```

ES6
```
// 引入整库
import Cesium from "cesium/Cesium"
var viewer = new Cesium.Viewer("cesiumContainer")
// 按需引入
import Color from "cesium/Core/Color"
var color = Color.fromRandom()
```

需要引入资源文件
```
require("cesium/Widgets/widgets.css")
```

13、最后最后！修改`src/index.js`

```
var Cesium = require("cesium/Cesium");
require("cesium/Widgets/widgets.css");

var viewer = new Cesium.Viewer("cesiumContainer");
```

输入`npm start`运行，浏览器查看效果