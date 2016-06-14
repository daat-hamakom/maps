var bourbon = require('node-bourbon').includePaths
var path = require('path')
var webpack = require('webpack')

module.exports = {
    entry: './index.js',
    output: {
        path: __dirname,
        filename: 'static/js/bundle.js',
    },
    resolve: {
        alias: {
            'webworkify': 'webworkify-webpack'
        }
    },
    module: {
        loaders: [
            { test: /\.json$/, loader: 'json-loader' },
            {
                test: /\.js$/,
                include: path.resolve(__dirname, 'node_modules/mapbox-gl/js/render/painter/use_program.js'),
                loader: 'transform/cacheable?brfs'
            },
            {
                test: /\.js$/,
                include: path.resolve(__dirname, 'node_modules/mapbox-gl-shaders/index.js'),
                loader: 'transform/cacheable?brfs'
            },
            { test: /\.js$/, exclude: /node_modules/, loader: 'babel' },
            { test: /\.scss$/, loader: 'style!css!sass?includePaths[]=' + bourbon }
        ]
    },
    postLoaders: [{
        include: /node_modules\/mapbox-gl/,
        loader: 'transform',
        query: 'brfs'
    },
    {
        include: /node_modules\/mapbox-gl-shaders/,
        loader: 'transform',
        query: 'brfs'
    }],
    plugins: [
        new webpack.ProvidePlugin({
            'fetch': 'imports?this=>global!exports?global.fetch!whatwg-fetch'
        })
    ]
}
