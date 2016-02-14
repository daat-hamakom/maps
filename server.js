import compress from 'compression'
import express from 'express'
import path from 'path'
import webpack from 'webpack'

const app = express()

const production = (process.env['NODE_ENV'] === 'production')
const static_path = path.join(process.cwd(), 'static')
const js_path = path.join(static_path, 'js')

app.use(compress())
app.disable('x-powered-by')

app.use('/static', express.static(static_path))

app.get('/*.js', function (req, res) {
  res.sendFile(req.params[0] + '.js', { root: js_path }, function (err) {
    if (err) {
      res.status(err.status).end()
    }
  })
})

app.get('/', function (req, res) {
  res.sendFile('index.html', { root: process.cwd() })
})

app.get('/admin', function (req, res) {
  res.redirect('https://daat-hamakom-data.herokuapp.com/admin/')
})

const port = Number(process.env['PORT'] || 3000)

if (production) {
  app.listen(port, function () {
    console.log(`✅  Server running on port ${port}`)
  })
}
else {
  var config = require('./webpack.config');
  var WebpackDevServer = require('webpack-dev-server');

  new WebpackDevServer(webpack(config)).listen(port, '0.0.0.0', function (err, res) {
    if (err) {
      console.log(err)
    }
    console.log(`✅  Dev server running on port ${port}`)
  })
}
