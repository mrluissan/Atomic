const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const OfflinePlugin = require('offline-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = (env, options) => {
	const isDevMode = options.mode !== 'production';
	const publicURL = 'https://atomic-app.netlify.com/';
	return {
		mode: 'development',
		entry: {
			app: './src/index.js',
		},
		plugins: [
			new MiniCssExtractPlugin({
				filename: isDevMode ? '[name].css' : '[name].[hash].css',
				chunkFilename: isDevMode ? '[id].css' : '[id].[hash].css'
			}),
			new HtmlWebpackPlugin({
				template: './src/index.html',
				filename: './index.html',
				url: isDevMode ? '' : publicURL
			}),
			new OfflinePlugin({
				// Unless specified in webpack's configuration itself
				publicPath: '/',
				externals: [
					'/',
					'/index.html',
					'./index.html'
				],
				ServiceWorker: {
					output: './sw.js'
				}
			}),
			new CopyWebpackPlugin([
				{
					from: './src/manifest.json',
					to: '.',
					toType: 'dir'
				},
				{
					from: './src/browserconfig.xml',
					to: '.',
					toType: 'dir'
				},
				{
					from: './src/favicon.ico',
					to: '.',
					toType: 'dir'
				},
				{
					from: './assets/icons',
					to: './assets/icons',
					toType: 'dir'
				},
				{
					from: './assets/img',
					to: './assets/img',
					toType: 'dir'
				}
			])
		],
		output: {
			path: path.resolve(__dirname, 'docs'),
			publicPath: isDevMode ? '/' : publicURL,
			filename: isDevMode ? '[name].js' : '[name].[hash].js'
		},
		module: {
			rules: [{
				enforce: 'pre',
				test: /\.js$/,
				exclude: /node_modules/,
				loader: 'eslint-loader'
			},
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: 'babel-loader'
			},
			{
				test: /\.(sa|sc|c)ss$/,
				use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader']
			},
			{
				test: /\.(png|jpg|gif|woff(2)?)$/,
				use: [{
					loader: 'file-loader',
					options: {
						name(file) {
							if (isDevMode) {
								return '[path][name].[ext]';
							}
							return '[path][name].[hash].[ext]';
						}
					}
				}]
			},
			{
				test: /\.svg$/,
				use: {
					loader: 'file-loader',
					options: {
						name: '[path][name].[ext]'
					}
				}
			},
			]
		},
		devtool: isDevMode ? 'eval-source-map' : 'source-map',
		devServer: {
			contentBase: path.join(__dirname, 'docs'),
			publicPath: '/docs',
			watchContentBase: true,
			compress: true,
			port: 9000,
			disableHostCheck: true
		},
		optimization: {
			minimizer: [
				new UglifyJsPlugin({
					uglifyOptions: {
						compress: {
							collapse_vars: false
						}
					}
				})
			]
		}
	};
};
