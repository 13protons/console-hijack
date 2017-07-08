const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  entry: './index.js',
  output: {
    filename: './dist/streams.js'
  },
  module: {
    loaders: [{
      test: /.js$/,
      loaders: 'buble-loader',
      // include: path.join(__dirname, 'src'),
      query: {
        objectAssign: 'Object.assign'
      }
    }]
  },
  devtool: "#source-map",
  plugins: [
    new UglifyJSPlugin({
      sourceMap: true,
      mangle: {
        // Skip mangling these
        except: ['$super', '$', 'exports', 'require']
      }
    })
  ],
};
