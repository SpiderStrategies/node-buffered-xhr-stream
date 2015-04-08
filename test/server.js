var http = require('http')

var server = http.createServer(function (req, res) {
  if (req.url == '/404') {
    res.statusCode = 404
    return res.end()
  }

  res.end('foos and bars')
}).listen(parseInt(process.env.PORT))
