const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const IgnoreEmitPlugin = require('ignore-emit-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

// * 管理所有要編譯的 HTML 檔案
const HTML_ENTRY_FILES = [
  './src/index.html'
];

const HTML_BUNDLE_LIST = HTML_ENTRY_FILES.map(filePath => {
  return new HtmlWebpackPlugin({
    filename: filePath.substr(filePath.lastIndexOf('/') + 1),
    template: filePath,
    minify: false,
    inject: false
  });
});

// * 環境變數
console.log(process.env.NODE_ENV);

// * 主要設定
module.exports = {
  // 進入點：
  entry: {
    main: path.resolve(__dirname, './src/resources/js/main.js'),
    vendor: path.resolve(__dirname, './src/resources/js/_vendor.js'),
  },
  // 輸出點：主要會產出在 dist 資料夾，編譯 JS 並輸出至 dist/resources/js
  output: {
    filename: './resources/js/[name].js',
    path: path.resolve(__dirname, './dist')
  },
	target: ['web', 'es5'],
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
      },
      {
        test: /\.(scss|sass)$/i,
        include: path.resolve('./src/resources/scss'),
        exclude: path.resolve('./node_modules'),
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: { 
              publicPath: '../../',
            },
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
      },
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
  },
  plugins: [
    // 編譯前需要清除之前的檔案
    new CleanWebpackPlugin(),
    // 編譯 CSS 並輸出至 dist/resources/css
    new MiniCssExtractPlugin({
      filename: './resources/css/[name].css'
    }),
    // 忽略檔案，因為 CSS 也被寫在 Entry 裡面，所以編譯時也會產出同名的 JS 檔案，需要忽略掉他
    new IgnoreEmitPlugin(['vendor.js']),
    // 設定要編譯的 HTML 檔案
    ...HTML_BUNDLE_LIST,
    // 移動靜態檔案
    // new CopyPlugin({
    //   patterns: [{ from: './src/resources/img/favicon', to: './resources/img/favicon' }]
    // }),
  ],
  devServer: {
    contentBase: path.join(__dirname, './dist'),
    compress: true,
    port: 3000,
    stats: {
      assets: true,
      cached: false,
      chunkModules: false,
      chunkOrigins: false,
      chunks: false,
      colors: true,
      hash: false,
      modules: false,
      reasons: false,
      source: false,
      version: false,
      warnings: false
    }
  }
};