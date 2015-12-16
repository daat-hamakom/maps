import compress from 'compression'
import express from 'express'
import path from 'path'
import webpack from 'webpack'

const app = express()

const production = (process.env['NODE_ENV'] === 'production')
const static_path = path.join(process.cwd(), 'static')


app.use(compress())
app.disable('x-powered-by')

app.use('/static', express.static(static_path))

app.get('/', function (req, res) {
  res.sendFile('index.html', { root: process.cwd() })
})

app.get('/admin', function (req, res) {
  res.redirect('https://daat-hamakom-data.herokuapp.com/admin/')
})

const port = Number(process.env['PORT'] || 3000)

app.listen(port, function () {
  console.log(`✅  Server running on port ${port}`)
})


if (!production) {
  var config = require('./webpack.config');
  var WebpackDevServer = require('webpack-dev-server');

  new WebpackDevServer(webpack(config)).listen(3000, 'localhost', function (err, res) {
    if (err) {
      console.log(err)
    }
    console.log('Listening at localhost:3000')
  })
}
