# buffered-xhr-stream

A node stream that wraps xhr GET requests as a stream.

Created because the browserify node http module emits all the data as it's received, and it cannot be paused. This can cause the browser to peg the cpu if it's a large request. This module allows you to pause the stream, so it stops emitting data events. XHR responseText is buffered anyway, so when this stream is resumed, it starts emitting buffered data stored in responseText.

## USAGE

```javascript
var XHRStream = require('buffered-xhr-stream')
  , xhr = new XMLHttpRequest

xhr.open('GET', '/some-large-docs.json', true)

var stream = new XHRStream({ xhr: xhr })
  , count = 0

stream.on('data', function (d) {
  if (++count % 10 === 0) {
    stream.pause()
  }
  console.log(d)
})

// or

var XHRStream = require('buffered-xhr-stream')

var stream = new XHRStream({ url: 'http://some-large-docs.json' })
  , count = 0

stream.on('data', function (d) {
  if (++count % 10 === 0) {
    stream.pause()
  }
  console.log(d)
})

```

You can specify additional options when initializing.

When using the xhr option:

```javascript
var XHRStream = require('buffered-xhr-stream')
  , xhr = new XMLHttpRequest

xhr.open('GET', '/some-large-docs.json', true)
var stream = new XHRStream({ xhr: xhr, chunkSize: 2048 })
```

When using the url option

```javascript
var XHRStream = require('buffered-xhr-stream')
var stream = new XHRStream({
  url: 'http://some-large-docs.json',
  method: 'GET',
  contentType: 'application/json',
  data: 'data passed to xhr.send()',
  chunkSize: 2048
})
```
