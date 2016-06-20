var bourbon = require('node-bourbon').includePaths
var webpack = require('webpack')

module.exports = {
    entry: './index.js',
    output: {
        path: __dirname,
        filename: 'static/js/bundle.js',
    },
    module: {
        loaders: [
            { test: /\.js$/, exclude: /node_modules/, loader: 'babel' },
            { test: /\.css$/, loader: 'style!css' },
            { test: /\.scss$/, loader: 'style!css!sass?includePaths[]=' + bourbon }
        ]
    },
    plugins: [
        new webpack.ProvidePlugin({
            'fetch': 'imports?this=>global!exports?global.fetch!whatwg-fetch'
        })
    ]
}
