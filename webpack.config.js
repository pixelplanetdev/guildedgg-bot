module.exports = {
  target: 'node',
  entry: './src/index.js',
  mode: 'production',
  node: {
    __dirname: false,
  },
  module: {
    rules: [
      {
        test: /\.(js)$/,
        exclude: /node_modules/,
        use: ['babel-loader']
      },
      {
        test: /\.node$/,
        loader: 'node-loader',
      }
    ]
  },
  resolve: {
    extensions: ['*', '.js']
  },
  output: {
    path: __dirname + '/dist',
    publicPath: '/',
    filename: 'index.js'
  },
  devServer: {
    contentBase: './dist'
  }
};
