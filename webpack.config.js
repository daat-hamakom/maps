var bourbon = require('node-bourbon').includePaths
var path = require('path')
var webpack = require('webpack')

module.exports = {
    entry: './index.js',
    output: {
        path: path.resolve(__dirname, 'static/js'),
        filename: 'bundle.js',
    },
    module: {
        loaders: [
            { test: /\.js$/, exclude: /node_modules/, loader: 'babel' },
            { test: /\.scss$/, loader: 'style!css!sass?includePaths[]=' + bourbon },
            {
                test: /\.json$/,
                loader: 'json-loader'
            },
            {
                test: /\.js$/,
                include: path.resolve(__dirname, 'node_modules/react-map-gl/node_modules/mapbox-gl/js/render/shaders.js'),
                loader: 'transform/cacheable?brfs'
            },
            {
                test: /\.js$/,
                include: path.resolve(__dirname, 'node_modules/webworkify/index.js'),
                loader: 'worker'
            }
        ]
    },
    plugins: [
        new webpack.ProvidePlugin({
            'fetch': 'imports?this=>global!exports?global.fetch!whatwg-fetch'
        })
    ]
}
