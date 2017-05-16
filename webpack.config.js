var path = require('path');

module.exports = {
  entry: {
    'bundle': './index.js',
    'view4': './view/view4.js'
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'umd'
  }
};