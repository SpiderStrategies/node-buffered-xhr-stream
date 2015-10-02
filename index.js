var stream = require('stream')
  , util = require('util')

function Stream (options) {
  if (!options) {
    throw new Error('options are required')
  }
  if (!options.xhr && !options.url) {
    throw new Error('options.xhr or options.url is required')
  }

  stream.Stream.call(this)
  this.offset = 0
  this.chunkSize = options.chunkSize || 65536
  this.readable = true
  this.writeable = true
  this._state = 'flowing'
  this.capable = true
  this.downloaded = false

  this.xhr = options.xhr
  if (options.url) {
    this.xhr = new XMLHttpRequest
    this.xhr.open(options.method || 'GET', options.url, true)
  }
  if (options.contentType) {
    this.xhr.setRequestHeader('Content-type', options.contentType)
  }
  this.xhr.onreadystatechange = this.handle.bind(this)
  this.xhr.send(options.data)
}

util.inherits(Stream, stream.Stream)

Stream.prototype.handle = function () {
  this.emit('readystatechange', this.xhr.readyState)
  if (this.capable && this.xhr.readyState === XMLHttpRequest.LOADING) {
    try {
      this.write()
    } catch (e) {
      this.capable = false
    }
  } else if (this.xhr.readyState === XMLHttpRequest.DONE) {
    if (this.xhr.status >= 400) {
      var e = new Error(this.xhr.statusText || this.xhr.status)
      e.xhr = this.xhr
      this.emit('error', e)
    } else {
      this.downloaded = true
      flush(this)
    }
  }
}

Stream.prototype.write = function () {
  if (this._state === 'paused') {
    return
  }

  // Noop Automatically writes to responseText, go ahead and flush
  flush(this)
}

function flush (stream) {
  // In IE9, responseText will be "unknown" (not undefined) until the response is done, and
  // any attempt to access it throws this error:
  //   SCRIPT10: The data necessary to complete this operation is not yet available
  if (typeof stream.xhr.responseText === 'unknown' || !stream.xhr.responseText) {
    return
  }
  while (stream._state === 'flowing' && stream.xhr.responseText.length - stream.offset != 0 &&
    (stream.downloaded || stream.xhr.responseText.length - stream.offset >= stream.chunkSize)) {
    var chunk = stream.xhr.responseText.substr(stream.offset, stream.chunkSize)
    stream.offset += chunk.length
    // emit chunk LAST in case triggering the data event leads to even more
    // data being flushed
    stream.emit('data', chunk)
  }

  if (stream.offset === stream.xhr.responseText.length) {
    stream.emit('end')
  }
}

Stream.prototype.pause = function () {
  if (this._state === 'paused') {
    return
  }
  this._state = 'paused'
  this.emit('pause')
}

Stream.prototype.resume = function () {
  this._state = 'flowing'
  flush(this)
}

module.exports = Stream
