# Webpack 使用筆記

我個人在使用 webpack 上所做的筆記以及專案模板。

## 專案檔案架構配置

```
/dist
  ∟ /resources
    ∟ /img
    ∟ /css
    ∟ /js
/src
  ∟ /components
  ∟ /resources
    ∟ /img
    ∟ /js
      ∟ /plugins
      ∟ /components
    ∟ /scss
      ∟ /utils
      ∟ /basic
      ∟ /models
      ∟ /components
      ∟ /plugins

package-lock.json
package.json
publicPath.json
webpack.config.js
```

---

## 安裝 Webpack 與相關套件

### 1、專案初始化 

```sh
$ npm init -y
```

### 2、安裝 webpack 與 webpack-cli

```sh
$ npm install webpack webpack-cli --save-dev
```

### 3、安裝 cross-env 與設定環境變數

```sh
$ npm install cross-env --save-dev
```

`cross-env` 可以幫助作業系統認識 node.js 的環境變數，環境變數分成 **development（開發版本）** 與 **production（發布版本）** ，在 JavaScript 裡面可以使用 `process.env.NODE_ENV` 來取得環境變數參數。

```json
process.env.NODE_ENV; // development or production
```

接著要在 `package.json` 裡面設定：

```json
"scripts": {
  "start": "cross-env NODE_ENV=development webpack --mode development",
  "build": "cross-env NODE_ENV=production webpack --mode production"
}
```

### 4、安裝 clean-webpack-plugin

這個套件可以清除編譯後的檔案，webpack 每次編譯前都需要清除之前的檔案。

```sh
$ npm install clean-webpack-plugin --save-dev
```

### 5、安裝 File Loader

這個套件可以幫助我們移動檔案。

```sh
$ npm install file-loader --save-dev
```

### 6、安裝 CSS Loader、SASS Loader 與其相關套件

- **CSS Loader**：處理與編譯 CSS。
- **Sass Loader** 、 **Node Sass**：編譯 SASS / CSS。
- **Mini CSS Extract Plugin**：輸出 CSS 檔案。

```sh
$ npm install css-loader node-sass sass-loader mini-css-extract-plugin --save-dev
```

### 7、安裝 Postcss 與 Autoprefixer

為了幫 CSS 檔案添加前綴詞，所以必須要安裝 `Post CSS` 與 `Autoprefixer`。

```sh
$ npm install postcss postcss-loader autoprefixer --save-dev
```

### 8、安裝 Ignore Emit Plugin

編譯 CSS 檔案需要在 entry 裡面指定同名的 JavaScript 檔案，並在程式裡面 import CSS，但在 output 就會產生檔名一樣的 JavaScript 檔案，所以需要透過 `ignore-emit-webpack-plugin` 將檔案排除掉。

```sh
$ npm install ignore-emit-webpack-plugin --save-dev
```

### 9、安裝 Babel

為了編譯 ES6 的 JavaScript，所以需要安裝 Babel 與 Babel Loader。

```sh
$ npm install babel-loader @babel/core @babel/preset-env --save-dev
```

有些 JavaScript 語法在 IE 無法支援，有時候會需要引入 `polyfill` 來解決這個問題。

```sh
$ npm install @babel/polyfill --save
```

在主要進入點的 JavaScript 檔案（`index.js` 或是 `main.js`）引入 `polyfill`，並打包在 JavaScript 裡面。

```js
import '@babel/polyfill';
```

### 10、複製靜態檔案

使用 `copy-webpack-plugin` 可以將檔案移動輸出，這邊主要會是移動靜態檔案。

```sh
$ npm install copy-webpack-plugin --save-dev
```

### 11、複製 HTML 檔案

這個套件可以管理與編譯 HTML 檔案。

```sh
$ npm install html-webpack-plugin --save-dev
```

### 12、安裝 Webpack Dev Server

`webpack-dev-server` 可以開一個 web server 的環境讓我們瀏覽網頁。

```sh
$ npm install webpack-dev-server --save-dev
```

接著在 `package.json` 添加指令。

```json
"scripts": {
  "serve": "cross-env NODE_ENV=development webpack serve --mode development --open"
}
```

在終端機輸入 `npm run serve` 即可開啟。

```sh
npm run serve
```

---

## 設定 Webpack

首先需要先在目錄添加 `webpack.config.js`，做為 `webpack` 的設定檔。

- **entry（進入點）**：要輸出的 JavaScript 檔案都在這邊做引入，若需要分離輸出 CSS 檔案，也需要在這邊引入同名的 JavaScript 檔案，並在程式裡面 import CSS 檔案。
- **output（輸出點）**：主要會產出在 dist 資料夾，編譯 JavaScript 並輸出至 `dist/resources/js` 資料夾。
- **plugins（套件）**：plugins 是提供 `webpack` 額外功能的模組，這邊先安裝 `CleanWebpackPlugin`，讓 `webpack` 編譯前清除之前的檔案。

```js
const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  entry: {
    main: path.resolve(__dirname, './src/resources/js/main.js')
  },
  output: {
    filename: './resources/js/[name].js',
    path: path.resolve(__dirname, './dist')
  },
	plugins: [
		new CleanWebpackPlugin()
	]
};
```

### 設定 JavaScript 編譯

開發用的 JavaScript 檔案放在 `./src/resources/js` 裡面，經過編譯後會輸出到 `./dist/resources/js` 裡面，這邊會執行的是合併、babel、uglify。首先需要在 `module.rules` 替 JavaScript 檔案設定 `babel-loader`。

```js
module: {
  rules: [
    {
      test: /\.m?js$/,
      exclude: /(node_modules|bower_components)/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env']
        }
      }
    }
  ]
}
```

entry 與 output 的設定就是欲編譯的 JavaScript 檔案與輸出的位置

```js
entry: {
  main: path.resolve(__dirname, './src/resources/js/main.js'),
},
output: {
  filename: './resources/js/[name].js',
  path: path.resolve(__dirname, './dist')
}
```

在 filename 的 `[name]` 是指 entry 物件的 key

#### webpack 5 在 IE 11 編譯的問題

`webpack 5` 在預設是用 arrow function 打包整個程式專案，這個方式在 IE 11 瀏覽器一定是行不通的，這邊需要在 `webpack.config.js` 做一些設定才行。

```js
target: ['web', 'es5']
```

### 設定 SCSS 編譯

編譯 SCSS 會有這些步驟：

1. 使用 `sass-loader` 解析編譯 SCSS 檔案。
2. 使用 `PostCSS` 與 `Autoprefixer` 添加前綴詞。
3. 使用 `css-loader` 解析 CSS 檔案。
4. 使用 `MiniCssExtractPlugin` 輸出 CSS 檔案。

在 `module.rules` 設定 loader：

```js
module: {
  rules: [
    {
      test: /\.(scss|sass)$/i,
      include: path.resolve('./src/resources/scss'),
      exclude: path.resolve('./node_modules'),
      use: [
        {
          loader: MiniCssExtractPlugin.loader,
          options: { 
            publicPath: '../../',
          }
        },
        'css-loader',
        {
          loader: 'postcss-loader',
          options: {
            postcssOptions: {
              plugins: [
                ['autoprefixer']
              ]
            }
          }
        },
        'sass-loader'
      ]
    }
  ]
}
```

接著需要在 plugins 設定套件的相關設定：

```js
plugins: [
  // 編譯前需要清除之前的檔案
  new CleanWebpackPlugin(),
  // 編譯 CSS 並輸出至 dist/resources/css
  new MiniCssExtractPlugin({
    filename: './resources/css/[name].css'
  }),
  // 忽略產出 JS 檔案
  new IgnoreEmitPlugin(['vendor.js']),
  // 產出靜態檔案
  new CopyPlugin({
    patterns: [{ from: './src/resources/img/favicon', to: './resources/img/favicon' }]
  })
]
```

### 設定圖片輸出

圖片的部分會使用 `file-loader` 做輸出，會從 `./src/resources/img` 輸出至 `./dist/resources/img` ，由於圖片也會在 CSS 裡面的 url 被讀取到，所以這邊的設定會有點複雜。

```js
module: {
  rules: [
    {
      test: /\.(png|svg|jpg|jpge|gif)$/,
      include: path.resolve('./src/resources/img'),
      exclude: path.resolve('./node_modules'),
      use: {
        loader: 'file-loader',
        options: {
          name: '[name].[ext]',
          outputPath: './resources/img',
          publicPath: '../img/'
        }
      }
    }
  ]
}
```
