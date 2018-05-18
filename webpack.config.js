const nodeExternals = require('webpack-node-externals')

module.exports = {
  entry: './app/index.js',
  target: 'electron-main',
  externals: [nodeExternals()],
  output: {
    path: `${__dirname}/static`,
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
        include: `${__dirname}/app`,
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
