var http = require('http')
var https = require('https')
var url = require('url')
var _ = require('underscore')
var jsdom = require('jsdom')

// just for html parser
var html5 = require('html5')
var Script = process.binding('evals').Script
var window = jsdom.jsdom(null, null, {parser: html5}).createWindow()
var parser = new html5.Parser({document: window.document})

var cookieJar = ''
var queries = []

function query() {
  return {options : {headers:{Cookie: cookieJar}}, body: '', ssl: false}
}

function setUrl (query, urlAddress) {
  var urlData = url.parse(urlAddress)
  query.options.host = urlData.hostname
  query.options.port = (urlData.port)? urlData.port : 80
  query.options.path = urlData.pathname
  
  if (urlData.search)
    query.options.path += urlData.search
  if (urlData.hash)
    query.options.path += urlData.hash
	
  query.options.ssl = urlData.protocol == 'https:'
	if(query.options.ssl)
		query.options.port = (urlData.port)? urlData.port : 443
}

function processCookie (cookies) {
  _.each(cookies, function(cookie) {
    if (cookieJar.length > 0)
      cookieJar += '; '
    var cookieData = cookie.split(';')
    cookieJar += cookieData[0]
  })
}

function processHeaders(headers) {
  _.each(headers, function(headerValue, headerName) {
    if (headerName.toLowerCase() == 'set-cookie') {
      processCookie(headerValue) 
    }
  })
}

exports.get = function(urlAddress) {
  var newQuery = query()
  newQuery.options.method = 'GET'
  setUrl(newQuery, urlAddress)
  queries.push(newQuery)
  
  return exports
}

exports.post = function(urlAddress) {
  var newQuery = query()
  newQuery.options.method = 'POST'
  setUrl(newQuery, urlAddress)
  queries.push(newQuery)
  
  return exports
}

exports.headers = function(headers) {
  console.error(' /!\\ NOT IMPLEMENTED YET')
  
  return exports
};

exports.data = function(data) {
  var i = queries.length - 1
  if (i < 0) {
    console.error('You must defined a HTTP method first [GET/POST...]')
    return exports
  }
  
  // querystring.stringify({foo: 'bar'}) ???
  _.each(data, function(value, key) {
    if (queries[i].body != '')
     queries[i].body +=  '&'
    
    queries[i].body += encodeURIComponent(key) + '=' + encodeURIComponent(value)
  })
  
  return exports
}

function _fetch (callback, i) {
  if (i < 0) {
    console.error('You must defined a HTTP method first [GET/POST...]')
    return exports
  }
  
  if (queries[i].options.method == 'POST') {
    queries[i].options.headers['Content-Type'] = 'application/x-www-form-urlencoded'
    queries[i].options.headers['Content-Length'] = queries[i].body.length
  }
  
  var resBody = []
  
  if (queries[i].options.ssl)
		var req = https.request(queries[i].options)
  else
		var req = http.request(queries[i].options)
  
  req.on('response', function(resp) {
      resp.on('data', function(chunk) {
        resBody.push(chunk)
      })
      
      resp.on('end', function() {
        var l, k, j
        for (var k = resBody.length - 1, l = 0; k >= 0; k--) {
                l += resBody[k].length;
        }
        var buf = new Buffer(l);
        for (var j = 0, k = 0, l = resBody.length; k < l; k++) {
          resBody[k].copy(buf, j);
          j += resBody[k].length;
        }
        queries.splice(i, 1)
        processHeaders(resp.headers)
        if(callback)
          callback(resp, buf)
      })
    })
  
  req.on('error', function(error) {
      console.error('HTTP++ ERROR 0x2A: ' + error)
  })
  
  if (queries[i].options.method == 'POST') {
    req.write(queries[i].body)
  }
  req.end()
}

// fetch last query
exports.fetch = function(callback) {
  var i = queries.length - 1

  _fetch(callback, i)
  
  return exports
}

// daisy chain calls
exports.chainJSDom = function(callback) {
  var i = queries.length - 1
  queries[i].callback = function(res, body) {   
    jsdom.env({
       html: body
      ,scripts: ['./jquery-1.6.1.min.js']
      },
      callback
    )
  }
  
  return exports
}

exports.chainJSDomWithHTML5 = function(callback) {
  var i = queries.length - 1
  queries[i].callback = function(res, body) {
	  parser.parse(body)
		jsdom.jQueryify(window, './jquery-1.6.1.min.js', function(window, $){
			 callback(null, window)
		})
  }
  
  return exports
}

exports.chainCallback = function(callback) {
  var i = queries.length - 1
  if (callback)
    queries[i].callback = callback
  else
    queries[i].callback = null
  
  return exports
}

function _enchain (i) {
  if (i > queries.length - 1) {
    queries = []
    return
  }
  var j = i
  _fetch(function (res, body){
    if(!queries[j])
      return
    if (queries[j].callback)
      queries[j].callback(res, body)
    
    if (queries[i + 1])
      queries[i + 1].options.headers.Cookie = cookieJar
    _enchain(i + 1)
  }, i)
}

exports.done = function() {
  if(queries.length == 1)
    _fetch(queries[0].callback, 0)
  else
    _enchain(0)
}


// aliases
exports.over = exports.done
exports.form = exports.data
exports.go = exports.fetch
exports.run = exports.fetch