const nodeExternals = require('webpack-node-externals')
const path = require('path')

module.exports = {
  entry: path.join('.', 'app', 'index.js'),
  target: 'electron-main',
  externals: [nodeExternals({
    whitelist: /react-file-drop/
  })],
  output: {
    path: path.join(__dirname, 'static'),
    filename: 'bundle.js',
    libraryTarget: 'commonjs2'
  },
  devtool: 'eval',
  mode: 'production',
  node: {
    __dirname: true
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: path.join(__dirname, 'app'),
        loader: 'babel-loader',
        query: {
          presets: ['react'],
          plugins: [
            'transform-object-rest-spread'
          ]
        }
      }
    ]
  }
}
