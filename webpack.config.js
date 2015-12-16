var bourbon = require('node-bourbon').includePaths

module.exports = {
    entry: './index.js',
    output: {
        path: __dirname,
        filename: 'static/js/bundle.js',
    },
    module: {
        loaders: [
            { test: /\.js$/, exclude: /node_modules/, loader: 'babel' },
            { test: /\.scss$/, loader: 'style!css!sass?includePaths[]=' + bourbon }
        ]
    }
}
