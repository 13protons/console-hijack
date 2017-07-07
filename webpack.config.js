module.exports = {
  entry: "./client/src/index.js",
  output: {
    filename: "./public/telemetry.js"
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
  }
}
