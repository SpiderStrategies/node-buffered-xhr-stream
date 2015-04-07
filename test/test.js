var test = require('tape')
  , Stream = require('../')
  , resolve = require('url').resolve
  , concat = require('concat-stream')

test('required options', function (t) {
  t.throws(function () {
    new Stream
  })
  t.end()
})

test('url or xhr required', function (t) {
  t.throws(function () {
    new Stream({})
  })
  t.doesNotThrow(function () {
    new Stream({url: '/foo'})
  })
  t.doesNotThrow(function () {
    var xhr = new XMLHttpRequest
      , url = resolve(location.href, '/data.txt')
    xhr.open('GET', url, true)
    new Stream({xhr: xhr})
  })
  t.end()
})

test('fetches all data', function (t) {
  t.plan(1)
  var url = resolve(location.href, '/data.txt')
    , s = new Stream({url: url})
    , write = concat(function (data) {
      t.equal(data, 'foos and bars')
    })

    setTimeout(function () {
      t.end()
    }, 500)

  s.pipe(write)
})

test('emits error on HTTP error', function (t) {
  t.plan(3)

  var url = resolve(location.href, '/404')
    , s = new Stream({url: url})

  s.on('error', function (err) {
    t.ok(err)
    t.equal(err.status, 404)
    t.equal(err.message, 'Not Found')

    t.end()
  })

  setTimeout(function () {
    t.end()
  }, 500)
})
