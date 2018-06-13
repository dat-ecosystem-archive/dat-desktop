const { DefinePlugin } = require('webpack')
const nodeExternals = require('webpack-node-externals')
const path = require('path')
module.exports = (_, argv) => ({
  entry: path.normalize(`${__dirname}/app/index.js`),
  target: 'electron-main',
  externals: [nodeExternals({
    whitelist: /react-file-drop/
  })],
  output: {
    path: path.normalize(`${__dirname}/static`),
    filename: 'bundle.js',
    libraryTarget: 'commonjs2'
  },
  devtool: 'inline-source-map',
  node: {
    __dirname: true
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: path.normalize(`${__dirname}/app`),
        loader: 'babel-loader',
        query: {
          presets: ['react'],
          plugins: [
            'transform-object-rest-spread'
          ]
        }
      }
    ]
  },
  plugins: [
    new DefinePlugin({
      'process.env.NODE_ENV': `"${argv.mode}"`
    })
  ]
})
